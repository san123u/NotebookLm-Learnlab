"""
Auth service.

Business logic for authentication operations.
"""

import os
import random
import uuid
from datetime import datetime, timedelta
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from loguru import logger

from pymongo.errors import DuplicateKeyError

from app.auth.jwt import create_access_token
from app.auth.passwords import hash_password, verify_password
from app.services.email import send_otp_email
from app.utils.email_validation import validate_email_for_auth_async

# OTP expiry in minutes
OTP_EXPIRY_MINUTES = 10

# OTP resend cooldown in seconds (configurable via env, default 2 minutes)
OTP_RESEND_COOLDOWN_SECONDS = int(os.environ.get("OTP_RESEND_COOLDOWN_SECONDS", 120))

# Master OTP for testing (from env)
MASTER_OTP = os.environ.get("MASTER_OTP", None)


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))


def get_email_domain(email: str) -> str:
    """Extract domain from email."""
    return email.split("@")[1] if "@" in email else ""


def check_otp_cooldown(user: dict) -> Optional[int]:
    """
    Check if user is still in OTP resend cooldown period.

    Returns:
        Remaining seconds if in cooldown, None if can resend
    """
    otp_sent_at = user.get("otp_sent_at")
    if not otp_sent_at:
        return None

    elapsed = (datetime.utcnow() - otp_sent_at).total_seconds()
    remaining = OTP_RESEND_COOLDOWN_SECONDS - elapsed

    if remaining > 0:
        return int(remaining)
    return None


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _auto_link_agent(self, user: dict) -> dict:
        """
        Automatically link user to agent if email matches.

        Returns:
            {"linked": bool, "agent_uuid": str or None}
        """
        # Skip if already linked
        if user.get("linked_agent_uuid"):
            return {"linked": False, "agent_uuid": user.get("linked_agent_uuid")}

        # Find agent by email
        agent = await self.db.agents.find_one({
            "email": user["email"].lower(),
            "is_active": True
        })

        if not agent:
            return {"linked": False, "agent_uuid": None}

        agent_uuid = agent.get("uuid")

        # Link user to agent
        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {"linked_agent_uuid": agent_uuid}}
        )

        # Link agent to user (set owner)
        await self.db.agents.update_one(
            {"uuid": agent["uuid"]},
            {"$set": {"owner_user_uuid": user["uuid"]}}
        )

        logger.info(f"Auto-linked user {user['email']} to agent {agent_uuid}")

        return {"linked": True, "agent_uuid": agent_uuid}

    async def auto_assign_domain(self, user: dict) -> Optional[dict]:
        """Auto-assign user to a domain based on email domain."""
        email_domain = get_email_domain(user.get("email", ""))

        if not email_domain:
            return None

        # Find matching domain
        domain = await self.db.domains.find_one({
            "domain": email_domain.lower(),
            "is_active": True
        })

        if not domain:
            logger.info(f"No matching domain found for {email_domain}")
            return None

        # Assign domain to user with "member" role
        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {
                "domain_uuid": domain["uuid"],
                "domain_role": "member"
            }}
        )

        logger.info(f"Auto-assigned user {user.get('email')} to domain {domain.get('domain')}")
        return domain

    async def _get_user_access(self, user_uuid: str) -> dict | None:
        """Get user's access from user_access collection."""
        access_doc = await self.db.user_access.find_one({"user_uuid": user_uuid})
        if not access_doc:
            return None

        companies = [
            {
                "uuid": c.get("uuid", ""),
                "role": c.get("role", "viewer"),
                "cascade": c.get("cascade", True)
            }
            for c in access_doc.get("companies", [])
        ]
        return {
            "companies": companies,
            "primary_company_uuid": access_doc.get("primary_company_uuid")
        }

    async def login(self, email: str, password: str) -> dict:
        """Authenticate user and return token."""
        # Validate email domain (checks both basic and custom blocklists)
        validation = await validate_email_for_auth_async(email)
        if not validation.is_valid:
            return {"error": validation.error_message, "status": 400}

        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"error": "Invalid email or password", "status": 401}

        if not user.get("password_hash") or not verify_password(password, user["password_hash"]):
            return {"error": "Invalid email or password", "status": 401}

        if user.get("status") == "pending":
            return {"error": "Please verify your email first", "status": 403}

        if user.get("status") == "suspended":
            return {"error": "Your account has been suspended", "status": 403}

        # Auto-link agent if email matches
        agent_link_result = await self._auto_link_agent(user)

        # Update last login
        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {"last_login_at": datetime.utcnow()}}
        )

        # Re-fetch user to get updated linked_agent_uuid
        user = await self.db.users.find_one({"uuid": user["uuid"]})

        # Create token with UUID as user_id
        token, expires_at = create_access_token(
            user_id=user["uuid"],
            email=user["email"],
            role=user.get("role", "viewer"),
        )

        # Get access from user_access collection
        access = await self._get_user_access(user["uuid"])

        return {
            "access_token": token,
            "expires_at": expires_at,
            "user": {
                "uuid": user["uuid"],
                "email": user["email"],
                "role": user.get("role"),  # System role (super_admin, super_viewer, or None)
                "status": user.get("status"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "department": user.get("department"),
                "linked_agent_uuid": user.get("linked_agent_uuid"),
                "access": access,
            },
            "agent_linked": agent_link_result.get("linked", False),
        }

    async def signup(self, email: str, password: str, first_name: Optional[str], last_name: Optional[str]) -> dict:
        """Create a new user account."""
        # Validate email domain (checks both basic and custom blocklists)
        validation = await validate_email_for_auth_async(email)
        if not validation.is_valid:
            return {"error": validation.error_message, "status": 400}

        existing = await self.db.users.find_one({"email": email.lower()})

        if existing:
            return {"error": "Email already registered", "status": 400}

        password_hash = hash_password(password)
        otp = generate_otp()
        now = datetime.utcnow()
        otp_expires = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        user = {
            "uuid": str(uuid.uuid4()),
            "email": email.lower(),
            "password_hash": password_hash,
            "first_name": first_name,
            "last_name": last_name,
            "role": None,  # System role (super_admin, super_viewer, or None)
            "status": "pending",
            "otp": otp,
            "otp_expires_at": otp_expires,
            "otp_sent_at": now,
            "otp_verified": False,
            "created_at": now,
            "updated_at": now,
        }

        try:
            await self.db.users.insert_one(user)
        except DuplicateKeyError:
            # Race condition: another request created this user between our check and insert
            return {"error": "Email already registered", "status": 400}

        await send_otp_email(email, otp, "signup")

        return {
            "message": "Account created. Please verify your email with the OTP sent.",
            "email": email,
        }

    async def verify_otp(self, email: str, otp: str) -> dict:
        """Verify OTP and activate account."""
        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"error": "User not found", "status": 404}

        # Check master OTP or regular OTP
        if MASTER_OTP and otp == MASTER_OTP:
            pass
        elif user.get("otp") != otp:
            return {"error": "Invalid OTP", "status": 400}
        elif user.get("otp_expires_at") and datetime.utcnow() > user["otp_expires_at"]:
            return {"error": "OTP has expired", "status": 400}

        # Activate user
        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {
                "status": "active",
                "otp_verified": True,
                "otp": None,
                "otp_expires_at": None,
                "otp_sent_at": None,
                "last_login_at": datetime.utcnow(),
            }}
        )

        await self.auto_assign_domain(user)

        # Re-fetch user
        user = await self.db.users.find_one({"uuid": user["uuid"]})

        # Auto-link agent if email matches
        agent_link_result = await self._auto_link_agent(user)

        # Re-fetch user again to get linked_agent_uuid
        user = await self.db.users.find_one({"uuid": user["uuid"]})

        # Create token with UUID as user_id
        token, expires_at = create_access_token(
            user_id=user["uuid"],
            email=user["email"],
            role=user.get("role", "viewer"),
        )

        # Get access from user_access collection
        access = await self._get_user_access(user["uuid"])

        return {
            "access_token": token,
            "expires_at": expires_at,
            "user": {
                "uuid": user["uuid"],
                "email": user["email"],
                "role": user.get("role"),  # System role (super_admin, super_viewer, or None)
                "status": user.get("status"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "department": user.get("department"),
                "linked_agent_uuid": user.get("linked_agent_uuid"),
                "access": access,
            },
            "agent_linked": agent_link_result.get("linked", False),
        }

    async def forgot_password(self, email: str) -> dict:
        """Request password reset."""
        # Validate email domain (checks both basic and custom blocklists)
        validation = await validate_email_for_auth_async(email)
        if not validation.is_valid:
            return {"error": validation.error_message, "status": 400}

        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"message": "If the email exists, an OTP has been sent."}

        # Don't allow password reset for suspended users
        if user.get("status") == "suspended":
            return {"error": "Your account has been suspended", "status": 403}

        # Check cooldown
        remaining = check_otp_cooldown(user)
        if remaining:
            return {
                "error": f"Please wait {remaining} seconds before requesting another code.",
                "status": 429,
                "retry_after": remaining
            }

        otp = generate_otp()
        now = datetime.utcnow()
        otp_expires = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {
                "otp": otp,
                "otp_expires_at": otp_expires,
                "otp_sent_at": now
            }}
        )

        await send_otp_email(email, otp, "reset")

        return {"message": "If the email exists, an OTP has been sent."}

    async def reset_password(self, email: str, otp: str, new_password: str) -> dict:
        """Reset password using OTP."""
        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"error": "User not found", "status": 404}

        # Don't allow password reset for suspended users
        if user.get("status") == "suspended":
            return {"error": "Your account has been suspended", "status": 403}

        if MASTER_OTP and otp == MASTER_OTP:
            pass
        elif user.get("otp") != otp:
            return {"error": "Invalid OTP", "status": 400}
        elif user.get("otp_expires_at") and datetime.utcnow() > user["otp_expires_at"]:
            return {"error": "OTP has expired", "status": 400}

        # Update password and activate if pending (OTP verifies email)
        update_fields = {
            "password_hash": hash_password(new_password),
            "otp": None,
            "otp_expires_at": None,
            "otp_sent_at": None,
        }

        # If user was pending (e.g., invited user), activate them
        if user.get("status") == "pending":
            update_fields["status"] = "active"
            update_fields["otp_verified"] = True

        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": update_fields}
        )

        return {"message": "Password reset successfully"}

    async def resend_otp(self, email: str) -> dict:
        """Resend OTP for email verification or password reset."""
        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"message": "If the email exists, an OTP has been sent."}

        # Don't allow OTP resend for suspended users
        if user.get("status") == "suspended":
            return {"error": "Your account has been suspended", "status": 403}

        # Check cooldown
        remaining = check_otp_cooldown(user)
        if remaining:
            return {
                "error": f"Please wait {remaining} seconds before requesting another code.",
                "status": 429,
                "retry_after": remaining
            }

        otp = generate_otp()
        now = datetime.utcnow()
        otp_expires = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {
                "otp": otp,
                "otp_expires_at": otp_expires,
                "otp_sent_at": now
            }}
        )

        purpose = "signup" if user.get("status") == "pending" else "verify"
        await send_otp_email(email, otp, purpose)

        return {"message": "OTP has been sent to your email."}

    async def request_login_otp(self, email: str) -> dict:
        """Send OTP for passwordless login."""
        # Validate email domain (checks both basic and custom blocklists)
        validation = await validate_email_for_auth_async(email)
        if not validation.is_valid:
            return {"error": validation.error_message, "status": 400}

        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"error": "We couldn't find an account with that email.", "status": 404}

        if user.get("status") == "suspended":
            return {"error": "Your account has been suspended", "status": 403}

        if user.get("status") == "pending":
            return {"error": "Please verify your account first", "status": 403}

        # Check cooldown
        remaining = check_otp_cooldown(user)
        if remaining:
            return {
                "error": f"Please wait {remaining} seconds before requesting another code.",
                "status": 429,
                "retry_after": remaining
            }

        otp = generate_otp()
        now = datetime.utcnow()
        otp_expires = now + timedelta(minutes=OTP_EXPIRY_MINUTES)

        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {
                "otp": otp,
                "otp_expires_at": otp_expires,
                "otp_sent_at": now
            }}
        )

        await send_otp_email(email, otp, "login")

        return {"message": "Code sent to your email."}

    async def verify_login_otp(self, email: str, otp: str) -> dict:
        """Verify OTP and log user in (passwordless)."""
        user = await self.db.users.find_one({"email": email.lower()})

        if not user:
            return {"error": "Invalid email or OTP", "status": 401}

        if user.get("status") == "suspended":
            return {"error": "Your account has been suspended", "status": 403}

        if user.get("status") == "pending":
            return {"error": "Please verify your account first", "status": 403}

        # Check master OTP or regular OTP
        if MASTER_OTP and otp == MASTER_OTP:
            pass
        elif user.get("otp") != otp:
            return {"error": "Invalid email or OTP", "status": 401}
        elif user.get("otp_expires_at") and datetime.utcnow() > user["otp_expires_at"]:
            return {"error": "OTP has expired", "status": 400}

        # Clear OTP and update login
        await self.db.users.update_one(
            {"uuid": user["uuid"]},
            {"$set": {
                "otp": None,
                "otp_expires_at": None,
                "otp_sent_at": None,
                "last_login_at": datetime.utcnow()
            }}
        )

        # Auto-link agent if email matches
        agent_link_result = await self._auto_link_agent(user)

        # Re-fetch user to get updated linked_agent_uuid
        user = await self.db.users.find_one({"uuid": user["uuid"]})

        # Create token with UUID as user_id
        token, expires_at = create_access_token(
            user_id=user["uuid"],
            email=user["email"],
            role=user.get("role", "viewer"),
        )

        # Get access from user_access collection
        access = await self._get_user_access(user["uuid"])

        return {
            "access_token": token,
            "expires_at": expires_at,
            "user": {
                "uuid": user["uuid"],
                "email": user["email"],
                "role": user.get("role"),  # System role (super_admin, super_viewer, or None)
                "status": user.get("status"),
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "department": user.get("department"),
                "linked_agent_uuid": user.get("linked_agent_uuid"),
                "access": access,
            },
            "agent_linked": agent_link_result.get("linked", False),
        }
