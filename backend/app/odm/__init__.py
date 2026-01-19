"""
ODM (Object Document Mapper) layer for MongoDB.

Provides Mongoose-style document classes for Python with Motor.

Directory Structure:
- document.py: Document base class and PyObjectId
- base.py: Extended base with file storage enums
- user.py: User, Group, AuditLog documents
- domain.py: Domain document for multi-tenancy
"""

# Base classes from document.py
from app.odm.document import Document, PyObjectId

# User and auth models
from app.odm.user import (
    UserDocument,
    GroupDocument,
    AuditLogDocument,
    # Role types
    SystemRoleStr,
    RoleStr,
    DomainRoleStr,
    UserStatusStr,
    # Backward compatibility
    EntityRoleStr,
    EntityRole,
    CompanyRole,
    EmbeddedGroupAssignment,
)

# Domain model for multi-tenancy
from app.odm.domain import DomainDocument

# Backward-compatible aliases
User = UserDocument
Group = GroupDocument
AuditLog = AuditLogDocument
Domain = DomainDocument

__all__ = [
    # Base
    "Document",
    "PyObjectId",

    # User models
    "UserDocument",
    "User",
    "GroupDocument",
    "Group",
    "AuditLogDocument",
    "AuditLog",

    # Domain
    "DomainDocument",
    "Domain",

    # Role types
    "SystemRoleStr",
    "RoleStr",
    "DomainRoleStr",
    "UserStatusStr",
    "EntityRoleStr",

    # Backward compatibility classes
    "EntityRole",
    "CompanyRole",
    "EmbeddedGroupAssignment",
]
