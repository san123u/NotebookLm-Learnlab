"""
Domain schemas for request/response validation.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class DomainCreateRequest(BaseModel):
    """Request to create a new domain."""

    domain: str = Field(..., description="Email domain without @ (e.g., 'esg.ae')")
    name: str = Field(..., description="Display name (e.g., 'ESG Group')")
    parent_domain_uuid: Optional[str] = Field(
        None, description="Parent domain UUID for hierarchy"
    )

    @field_validator("domain")
    @classmethod
    def normalize_domain(cls, v: str) -> str:
        """Normalize domain: lowercase, remove @ prefix."""
        return v.lower().lstrip("@").strip()


class DomainUpdateRequest(BaseModel):
    """Request to update a domain."""

    name: Optional[str] = None
    parent_domain_uuid: Optional[str] = None
    is_active: Optional[bool] = None


class DomainResponse(BaseModel):
    """Domain response."""

    uuid: str
    domain: str
    name: str
    parent_domain_uuid: Optional[str] = None
    hierarchy_path: List[str] = []
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DomainListResponse(BaseModel):
    """List of domains response."""

    domains: List[DomainResponse]
    total: int


class DomainTreeNode(BaseModel):
    """Domain tree node for hierarchy display."""

    uuid: str
    domain: str
    name: str
    is_active: bool
    children: List["DomainTreeNode"] = []


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str


# ==================== User Management Schemas ====================


class DomainUserResponse(BaseModel):
    """User in domain context."""

    uuid: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    domain_role: Optional[str] = None  # "admin" or "member"
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None


class DomainUserListResponse(BaseModel):
    """List of users in a domain."""

    users: List[DomainUserResponse]
    total: int


class UpdateDomainRoleRequest(BaseModel):
    """Request to update user's domain role."""

    domain_role: str = Field(..., pattern="^(admin|member)$")


class AssignUserToDomainRequest(BaseModel):
    """Request to assign a user to a domain."""

    user_id: str
    domain_role: str = Field(default="member", pattern="^(admin|member)$")
