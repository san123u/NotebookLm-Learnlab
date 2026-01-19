"""Schemas for account module."""

from pydantic import BaseModel
from typing import Optional


class AccountUpdateRequest(BaseModel):
    """Request to update account profile."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    phone_number: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    """Request to change password."""
    current_password: str
    new_password: str


class AccountResponse(BaseModel):
    """Account profile response."""
    uuid: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = None
    status: str
