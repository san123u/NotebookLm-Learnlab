"""
Domain document model for multi-tenant email domain management.

Domains represent email domains (@company.com) that:
- Map to entities for access control
- Have parent-child hierarchy for cascading access
- Control user access and management
"""

from typing import Optional, List, ClassVar, Literal
from datetime import datetime
from pydantic import Field
from bson import ObjectId

from app.odm.document import Document, PyObjectId


# Domain role types
DomainRoleStr = Literal["admin", "member"]


class DomainDocument(Document):
    """
    Domain document for email domain-based multi-tenancy.

    Features:
    - Email domain identity (e.g., "esg.ae")
    - Parent-child hierarchy for cascading access
    - hierarchy_path for efficient ancestor queries
    """

    __collection_name__: ClassVar[str] = "domains"

    # Identity
    domain: str  # Email domain WITHOUT @ (e.g., "esg.ae") - unique index
    name: str  # Display name (e.g., "ESG Group")

    # Hierarchy
    parent_domain_id: Optional[PyObjectId] = None  # Parent domain (null for root)
    hierarchy_path: List[str] = Field(default_factory=list)  # Ancestor domains for efficient queries

    # Status
    is_active: bool = True

    # ==================== Custom Class Methods ====================

    @classmethod
    async def find_by_domain(cls, domain: str) -> Optional["DomainDocument"]:
        """Find domain by email domain string."""
        # Normalize: remove @ if present, lowercase
        normalized = domain.lower().lstrip("@")
        return await cls.find_one({"domain": normalized})

    @classmethod
    async def find_children(cls, domain_id: ObjectId | str) -> List["DomainDocument"]:
        """Find all direct child domains."""
        if isinstance(domain_id, str):
            domain_id = ObjectId(domain_id)
        return await cls.find({"parent_domain_id": domain_id})

    @classmethod
    async def find_descendants(cls, domain: str) -> List["DomainDocument"]:
        """Find all descendant domains (children, grandchildren, etc.)."""
        return await cls.find({"hierarchy_path": domain.lower()})

    @classmethod
    async def find_root_domains(cls) -> List["DomainDocument"]:
        """Find all root domains (no parent)."""
        return await cls.find({"parent_domain_id": None, "is_active": True})

    # ==================== Instance Methods ====================

    def is_ancestor_of(self, other_domain: "DomainDocument") -> bool:
        """Check if this domain is an ancestor of another domain."""
        return self.domain in other_domain.hierarchy_path

    def is_descendant_of(self, other_domain: "DomainDocument") -> bool:
        """Check if this domain is a descendant of another domain."""
        return other_domain.domain in self.hierarchy_path

    async def get_ancestors(self) -> List["DomainDocument"]:
        """Get all ancestor domains in order (root first)."""
        if not self.hierarchy_path:
            return []

        ancestors = []
        for domain_str in self.hierarchy_path:
            domain = await self.find_by_domain(domain_str)
            if domain:
                ancestors.append(domain)
        return ancestors

    async def build_hierarchy_path(self) -> List[str]:
        """Build hierarchy_path from parent chain."""
        if not self.parent_domain_id:
            return []

        parent = await self.find_by_id(self.parent_domain_id)
        if not parent:
            return []

        # Parent's path + parent's domain
        return parent.hierarchy_path + [parent.domain]

    async def save(self) -> "DomainDocument":
        """Override save to auto-build hierarchy_path."""
        # Auto-build hierarchy_path before saving
        if self.parent_domain_id:
            self.hierarchy_path = await self.build_hierarchy_path()
        else:
            self.hierarchy_path = []

        # Normalize domain
        self.domain = self.domain.lower().lstrip("@")

        return await super().save()
