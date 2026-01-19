"""
Domain service for business logic.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.odm.domain import DomainDocument


class DomainService:
    """Service for domain management operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def create_domain(
        self,
        domain: str,
        name: str,
        parent_domain_uuid: Optional[str] = None,
        created_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a new domain.

        Validates:
        - Domain doesn't already exist
        - Parent domain exists (if specified)
        - No circular hierarchy
        """
        # Normalize domain
        normalized_domain = domain.lower().lstrip("@").strip()

        # Check if domain already exists
        existing = await DomainDocument.find_by_domain(normalized_domain)
        if existing:
            return {"error": f"Domain '{normalized_domain}' already exists", "status": 400}

        # Validate parent if specified
        parent_uuid = None
        if parent_domain_uuid:
            parent = await DomainDocument.find_by_uuid(parent_domain_uuid)
            if not parent:
                return {"error": "Parent domain not found", "status": 404}
            parent_uuid = parent_domain_uuid

        # Create domain document
        domain_doc = DomainDocument(
            domain=normalized_domain,
            name=name,
            parent_domain_uuid=parent_uuid,
        )

        # Save (hierarchy_path is auto-built in save())
        await domain_doc.save()

        return {"domain": domain_doc, "message": "Domain created successfully"}

    async def get_domain(self, domain_uuid: str) -> Optional[DomainDocument]:
        """Get a domain by UUID."""
        return await DomainDocument.find_by_uuid(domain_uuid)

    async def get_domain_by_name(self, domain: str) -> Optional[DomainDocument]:
        """Get a domain by domain string."""
        return await DomainDocument.find_by_domain(domain)

    async def list_domains(
        self,
        include_inactive: bool = False,
        parent_domain_uuid: Optional[str] = None,
    ) -> List[DomainDocument]:
        """
        List all domains with optional filters.
        """
        query: Dict[str, Any] = {}

        if not include_inactive:
            query["is_active"] = True

        if parent_domain_uuid:
            query["parent_domain_uuid"] = parent_domain_uuid
        elif parent_domain_uuid == "":
            # Empty string means root domains only
            query["parent_domain_uuid"] = None

        return await DomainDocument.find(query)

    async def get_root_domains(self) -> List[DomainDocument]:
        """Get all root domains (no parent)."""
        return await DomainDocument.find_root_domains()

    async def update_domain(
        self,
        domain_uuid: str,
        name: Optional[str] = None,
        parent_domain_uuid: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """
        Update a domain.

        Validates:
        - Domain exists
        - New parent exists (if changing)
        - No circular hierarchy
        """
        domain = await DomainDocument.find_by_uuid(domain_uuid)
        if not domain:
            return {"error": "Domain not found", "status": 404}

        # Update fields
        if name is not None:
            domain.name = name

        if is_active is not None:
            domain.is_active = is_active

        if parent_domain_uuid is not None:
            if parent_domain_uuid == "":
                # Clear parent (make root)
                domain.parent_domain_uuid = None
            else:
                # Validate new parent
                new_parent = await DomainDocument.find_by_uuid(parent_domain_uuid)
                if not new_parent:
                    return {"error": "New parent domain not found", "status": 404}

                # Check for circular hierarchy
                if await self._would_create_cycle(domain, new_parent):
                    return {"error": "Cannot set parent: would create circular hierarchy", "status": 400}

                domain.parent_domain_uuid = parent_domain_uuid

        # Save (hierarchy_path is auto-rebuilt)
        await domain.save()

        # If parent changed, update all descendants' hierarchy_paths
        if parent_domain_uuid is not None:
            await self._update_descendant_paths(domain)

        return {"domain": domain, "message": "Domain updated successfully"}

    async def delete_domain(self, domain_uuid: str) -> Dict[str, Any]:
        """
        Delete a domain.

        Validates:
        - Domain exists
        - Domain has no children
        - Domain has no users assigned (TODO: implement after user-domain integration)
        """
        domain = await DomainDocument.find_by_uuid(domain_uuid)
        if not domain:
            return {"error": "Domain not found", "status": 404}

        # Check for children
        children = await DomainDocument.find_children(domain_uuid)
        if children:
            return {
                "error": f"Cannot delete domain with {len(children)} child domains. Delete or reassign children first.",
                "status": 400,
            }

        # TODO: Check for users assigned to this domain

        await domain.delete()
        return {"message": f"Domain '{domain.domain}' deleted successfully"}

    async def get_domain_tree(self, root_domain_uuid: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get domain hierarchy as a tree structure.

        If root_domain_uuid is provided, returns subtree starting from that domain.
        Otherwise returns all root domains with their descendants.
        """
        if root_domain_uuid:
            root = await DomainDocument.find_by_uuid(root_domain_uuid)
            if not root:
                return []
            return [await self._build_tree_node(root)]
        else:
            roots = await self.get_root_domains()
            return [await self._build_tree_node(r) for r in roots]

    async def _build_tree_node(self, domain: DomainDocument) -> Dict[str, Any]:
        """Build a tree node with children."""
        children = await DomainDocument.find_children(domain.uuid)
        child_nodes = [await self._build_tree_node(c) for c in children]

        return {
            "uuid": domain.uuid,
            "domain": domain.domain,
            "name": domain.name,
            "is_active": domain.is_active,
            "children": child_nodes,
        }

    async def _would_create_cycle(
        self, domain: DomainDocument, new_parent: DomainDocument
    ) -> bool:
        """Check if setting new_parent as parent would create a cycle."""
        # If new_parent is a descendant of domain, it would create a cycle
        return domain.domain in new_parent.hierarchy_path or new_parent.domain == domain.domain

    async def _update_descendant_paths(self, domain: DomainDocument) -> None:
        """Update hierarchy_path for all descendants after parent change."""
        descendants = await DomainDocument.find_descendants(domain.domain)
        for descendant in descendants:
            descendant.hierarchy_path = await descendant.build_hierarchy_path()
            await descendant.save()

    async def get_accessible_domains(
        self, user_domain_uuid: str, user_domain_role: str
    ) -> List[DomainDocument]:
        """
        Get domains accessible to a user based on their domain and role.

        - domain_admin: Their domain + all descendant domains
        - member: Only their own domain
        """
        user_domain = await DomainDocument.find_by_uuid(user_domain_uuid)
        if not user_domain:
            return []

        if user_domain_role == "admin":
            # Get domain + all descendants
            descendants = await DomainDocument.find_descendants(user_domain.domain)
            return [user_domain] + descendants
        else:
            # Members only see their own domain
            return [user_domain]

    # ==================== User Management ====================

    async def get_domain_users(
        self, domain_uuid: str, include_children: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get all users in a domain.

        Args:
            domain_uuid: Domain UUID
            include_children: If True, include users from child domains
        """
        domain = await DomainDocument.find_by_uuid(domain_uuid)
        if not domain:
            return []

        if include_children:
            # Get all descendant domain UUIDs
            descendants = await DomainDocument.find_descendants(domain.domain)
            domain_uuids = [domain_uuid] + [d.uuid for d in descendants]
            query = {"domain_uuid": {"$in": domain_uuids}}
        else:
            query = {"domain_uuid": domain_uuid}

        users = await self.db.users.find(query).to_list(None)
        return users

    async def update_user_domain_role(
        self, user_uuid: str, domain_role: str
    ) -> Dict[str, Any]:
        """
        Update a user's domain role (admin or member).
        """
        user = await self.db.users.find_one({"uuid": user_uuid})
        if not user:
            return {"error": "User not found", "status": 404}

        await self.db.users.update_one(
            {"uuid": user_uuid},
            {"$set": {"domain_role": domain_role}}
        )

        user = await self.db.users.find_one({"uuid": user_uuid})
        return {"user": user, "message": "Domain role updated successfully"}

    async def assign_user_to_domain(
        self, user_uuid: str, domain_uuid: str, domain_role: str = "member"
    ) -> Dict[str, Any]:
        """
        Assign a user to a domain.
        """
        user = await self.db.users.find_one({"uuid": user_uuid})
        if not user:
            return {"error": "User not found", "status": 404}

        domain = await DomainDocument.find_by_uuid(domain_uuid)
        if not domain:
            return {"error": "Domain not found", "status": 404}

        await self.db.users.update_one(
            {"uuid": user_uuid},
            {"$set": {
                "domain_uuid": domain_uuid,
                "domain_role": domain_role
            }}
        )

        user = await self.db.users.find_one({"uuid": user_uuid})
        return {"user": user, "message": f"User assigned to domain '{domain.domain}'"}
