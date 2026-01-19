"""
Domains router.

Handles domain CRUD operations for multi-tenant management.
Initially restricted to super_admin only.
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.api.deps import get_db, get_current_user, require_role, require_domain_admin
from app.odm.user import UserDocument
from app.services.rbac import can_user_manage_domain
from .schemas import (
    DomainCreateRequest,
    DomainUpdateRequest,
    DomainResponse,
    DomainListResponse,
    DomainTreeNode,
    MessageResponse,
    DomainUserResponse,
    DomainUserListResponse,
    UpdateDomainRoleRequest,
    AssignUserToDomainRequest,
)
from .service import DomainService

router = APIRouter()


def domain_to_response(domain) -> DomainResponse:
    """Convert DomainDocument to DomainResponse."""
    return DomainResponse(
        uuid=domain.uuid,
        domain=domain.domain,
        name=domain.name,
        parent_domain_uuid=domain.parent_domain_uuid if domain.parent_domain_uuid else None,
        hierarchy_path=domain.hierarchy_path,
        is_active=domain.is_active,
        created_at=domain.created_at,
        updated_at=domain.updated_at,
    )


@router.post("", response_model=DomainResponse)
async def create_domain(
    request: DomainCreateRequest,
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Create a new domain.

    Requires super_admin role.
    """
    service = DomainService(db)
    result = await service.create_domain(
        domain=request.domain,
        name=request.name,
        parent_domain_uuid=request.parent_domain_uuid,
        created_by=current_user.uuid,
    )

    if "error" in result:
        raise HTTPException(status_code=result["status"], detail=result["error"])

    return domain_to_response(result["domain"])


@router.get("", response_model=DomainListResponse)
async def list_domains(
    include_inactive: bool = Query(False, description="Include inactive domains"),
    root_only: bool = Query(False, description="Only return root domains"),
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    List all domains.

    Requires super_admin role.
    """
    service = DomainService(db)

    if root_only:
        domains = await service.get_root_domains()
    else:
        domains = await service.list_domains(include_inactive=include_inactive)

    return DomainListResponse(
        domains=[domain_to_response(d) for d in domains],
        total=len(domains),
    )


@router.get("/tree", response_model=List[DomainTreeNode])
async def get_domain_tree(
    root_id: Optional[str] = Query(None, description="Start tree from this domain"),
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get domain hierarchy as a tree structure.

    Requires super_admin role.
    """
    service = DomainService(db)
    tree = await service.get_domain_tree(root_domain_id=root_id)
    return tree


@router.get("/{domain_id}", response_model=DomainResponse)
async def get_domain(
    domain_id: str,
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get a domain by ID.

    Requires super_admin role.
    """
    service = DomainService(db)
    domain = await service.get_domain(domain_id)

    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    return domain_to_response(domain)


@router.patch("/{domain_id}", response_model=DomainResponse)
async def update_domain(
    domain_id: str,
    request: DomainUpdateRequest,
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Update a domain.

    Requires super_admin role.
    """
    service = DomainService(db)
    result = await service.update_domain(
        domain_uuid=domain_id,
        name=request.name,
        parent_domain_uuid=request.parent_domain_uuid,
        is_active=request.is_active,
    )

    if "error" in result:
        raise HTTPException(status_code=result["status"], detail=result["error"])

    return domain_to_response(result["domain"])


@router.delete("/{domain_id}", response_model=MessageResponse)
async def delete_domain(
    domain_id: str,
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Delete a domain.

    Requires super_admin role.
    Domain must have no children or assigned users.
    """
    service = DomainService(db)
    result = await service.delete_domain(domain_id)

    if "error" in result:
        raise HTTPException(status_code=result["status"], detail=result["error"])

    return MessageResponse(message=result["message"])


@router.get("/lookup/{domain_name}", response_model=DomainResponse)
async def lookup_domain(
    domain_name: str,
    current_user: UserDocument = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Look up a domain by domain name (e.g., 'esg.ae').

    Available to authenticated users.
    """
    service = DomainService(db)
    domain = await service.get_domain_by_name(domain_name)

    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")

    return domain_to_response(domain)


# ==================== Domain Admin User Management ====================


def user_to_domain_response(user: dict) -> DomainUserResponse:
    """Convert user dict to DomainUserResponse."""
    return DomainUserResponse(
        uuid=user["uuid"],
        email=user["email"],
        first_name=user.get("first_name"),
        last_name=user.get("last_name"),
        domain_role=user.get("domain_role"),
        status=user.get("status"),
        created_at=user.get("created_at"),
        last_login_at=user.get("last_login_at"),
    )


@router.get("/{domain_id}/users", response_model=DomainUserListResponse)
async def list_domain_users(
    domain_id: str,
    include_children: bool = Query(False, description="Include users from child domains"),
    current_user: UserDocument = Depends(require_domain_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    List users in a domain.

    Requires domain_admin role (or super_admin).
    Domain admins can only see users in their domain and descendant domains.
    """
    # Verify access to this domain
    if current_user.role != "super_admin":
        if not await can_user_manage_domain(current_user, domain_id, db):
            raise HTTPException(
                status_code=403,
                detail="Access to this domain denied"
            )

    service = DomainService(db)
    users = await service.get_domain_users(domain_id, include_children=include_children)

    return DomainUserListResponse(
        users=[user_to_domain_response(u) for u in users],
        total=len(users),
    )


@router.patch("/{domain_id}/users/{user_id}/role", response_model=DomainUserResponse)
async def update_user_domain_role(
    domain_id: str,
    user_id: str,
    request: UpdateDomainRoleRequest,
    current_user: UserDocument = Depends(require_domain_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Update a user's domain role (admin or member).

    Requires domain_admin role (or super_admin).
    Domain admins can only manage users in their domain hierarchy.
    """
    # Verify access to this domain
    if current_user.role != "super_admin":
        if not await can_user_manage_domain(current_user, domain_id, db):
            raise HTTPException(
                status_code=403,
                detail="Access to this domain denied"
            )

    # Verify user is in this domain
    user = await db.users.find_one({"uuid": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.get("domain_uuid") != domain_id:
        raise HTTPException(
            status_code=400,
            detail="User does not belong to this domain"
        )

    # Prevent self-demotion for domain admins
    if current_user.uuid == user_id and request.domain_role != "admin":
        if current_user.role != "super_admin":
            raise HTTPException(
                status_code=400,
                detail="Cannot demote yourself from domain admin"
            )

    service = DomainService(db)
    result = await service.update_user_domain_role(user_id, request.domain_role)

    if "error" in result:
        raise HTTPException(status_code=result["status"], detail=result["error"])

    return user_to_domain_response(result["user"])


@router.post("/{domain_id}/users", response_model=DomainUserResponse)
async def assign_user_to_domain(
    domain_id: str,
    request: AssignUserToDomainRequest,
    current_user: UserDocument = Depends(require_role("super_admin")),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Assign a user to a domain.

    Requires super_admin role.
    """
    service = DomainService(db)
    result = await service.assign_user_to_domain(
        user_id=request.user_id,
        domain_id=domain_id,
        domain_role=request.domain_role,
    )

    if "error" in result:
        raise HTTPException(status_code=result["status"], detail=result["error"])

    return user_to_domain_response(result["user"])


@router.get("/my/accessible", response_model=DomainListResponse)
async def get_my_accessible_domains(
    current_user: UserDocument = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get domains accessible to the current user.

    - Super admins see all domains
    - Domain admins see their domain + descendants
    - Regular users see only their own domain
    """
    service = DomainService(db)

    if current_user.role in ("super_admin", "super_viewer"):
        domains = await service.list_domains()
    elif current_user.domain_id:
        domains = await service.get_accessible_domains(
            str(current_user.domain_id),
            current_user.domain_role or "member"
        )
    else:
        domains = []

    return DomainListResponse(
        domains=[domain_to_response(d) for d in domains],
        total=len(domains),
    )
