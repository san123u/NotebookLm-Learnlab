"""
Email Service

Provides email sending functionality for authentication flows.
This is a stub implementation that logs emails instead of sending them.

To implement actual email sending:
1. Add email provider configuration to core/config.py
2. Install required packages (e.g., sendgrid, mailgun, smtp)
3. Implement the send_email function with your provider

Example providers:
- SendGrid: pip install sendgrid
- Mailgun: pip install mailgun
- AWS SES: pip install boto3
- SMTP: use built-in smtplib
"""

import os
from typing import Optional
from loguru import logger


# Email configuration (set via environment variables)
EMAIL_ENABLED = os.environ.get("EMAIL_ENABLED", "false").lower() == "true"
EMAIL_FROM = os.environ.get("EMAIL_FROM", "noreply@example.com")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Core Platform")


async def send_email(
    to_email: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None,
) -> bool:
    """
    Send an email.

    Args:
        to_email: Recipient email address
        subject: Email subject line
        body_html: HTML body content
        body_text: Plain text body (optional, defaults to stripped HTML)

    Returns:
        True if email was sent successfully, False otherwise
    """
    if not EMAIL_ENABLED:
        # Log email content for development
        logger.info(
            f"Email (not sent - EMAIL_ENABLED=false):\n"
            f"  To: {to_email}\n"
            f"  Subject: {subject}\n"
            f"  Body: {body_text or body_html[:200]}..."
        )
        return True

    # TODO: Implement actual email sending with your provider
    # Example with SendGrid:
    # from sendgrid import SendGridAPIClient
    # from sendgrid.helpers.mail import Mail
    #
    # message = Mail(
    #     from_email=(EMAIL_FROM, EMAIL_FROM_NAME),
    #     to_emails=to_email,
    #     subject=subject,
    #     html_content=body_html,
    # )
    # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    # response = sg.send(message)
    # return response.status_code == 202

    logger.warning("Email sending not implemented. Configure your email provider.")
    return False


async def send_otp_email(email: str, otp: str, purpose: str = "verify") -> bool:
    """
    Send an OTP email for authentication.

    Args:
        email: Recipient email address
        otp: The one-time password
        purpose: Email purpose - "signup", "login", "reset", or "verify"

    Returns:
        True if email was sent successfully
    """
    subjects = {
        "signup": "Verify your email",
        "login": "Your login code",
        "reset": "Reset your password",
        "verify": "Your verification code",
    }

    subject = subjects.get(purpose, "Your verification code")
    app_name = EMAIL_FROM_NAME

    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">{subject}</h2>
        <p>Your verification code is:</p>
        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        ">{otp}</div>
        <p style="color: #666;">
            This code will expire in 10 minutes.
        </p>
        <p style="color: #999; font-size: 12px;">
            If you didn't request this code, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
            &copy; {app_name}
        </p>
    </div>
    """

    body_text = f"""
{subject}

Your verification code is: {otp}

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.
    """

    return await send_email(email, subject, body_html, body_text)


async def send_invitation_email(
    email: str,
    invitation_url: str,
    inviter_name: str,
    company_name: Optional[str] = None,
) -> bool:
    """
    Send a team invitation email.

    Args:
        email: Recipient email address
        invitation_url: URL to accept the invitation
        inviter_name: Name of the person who sent the invitation
        company_name: Optional company/organization name

    Returns:
        True if email was sent successfully
    """
    app_name = EMAIL_FROM_NAME
    subject = f"You've been invited to join {company_name or app_name}"

    body_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You're invited!</h2>
        <p>{inviter_name} has invited you to join {company_name or app_name}.</p>
        <p style="margin: 30px 0;">
            <a href="{invitation_url}" style="
                display: inline-block;
                padding: 12px 24px;
                background: #4F46E5;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
            ">Accept Invitation</a>
        </p>
        <p style="color: #666;">
            This invitation will expire in 24 hours.
        </p>
        <p style="color: #999; font-size: 12px;">
            If you didn't expect this invitation, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
            &copy; {app_name}
        </p>
    </div>
    """

    body_text = f"""
You're invited!

{inviter_name} has invited you to join {company_name or app_name}.

Accept your invitation: {invitation_url}

This invitation will expire in 24 hours.

If you didn't expect this invitation, you can safely ignore this email.
    """

    return await send_email(email, subject, body_html, body_text)
