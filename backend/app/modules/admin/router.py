"""Router for admin module."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.deps import get_db, require_super_admin
from app.odm.user import UserDocument
from app.modules.admin.service import AdminService
from app.modules.admin.schemas import (
    UserListParams,
    CreateUserRequest,
    UpdateUserRequest,
    UserResponse,
    UserListResponse,
    AdminStatsResponse,
)

router = APIRouter()


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: UserDocument = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get admin dashboard statistics."""
    service = AdminService(db)
    return await service.get_stats()


@router.get("/users", response_model=UserListResponse)
async def list_users(
    search: Optional[str] = Query(None, description="Search by email or name"),
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: UserDocument = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all users with filtering and pagination."""
    params = UserListParams(
        search=search,
        role=role,
        status=status,
        page=page,
        per_page=per_page,
    )
    service = AdminService(db)
    return await service.list_users(params)


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: UserDocument = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get a single user by ID."""
    service = AdminService(db)
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    data: CreateUserRequest,
    current_user: UserDocument = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new user (bypass normal signup flow)."""
    service = AdminService(db)
    try:
        return await service.create_user(data, str(current_user.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: UpdateUserRequest,
    current_user: UserDocument = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a user."""
    # Prevent self-modification of critical fields
    if user_id == current_user.uuid:
        if data.status == "suspended":
            raise HTTPException(status_code=400, detail="Cannot suspend yourself")
        if "role" in data.model_fields_set and data.role != "super_admin":
            raise HTTPException(status_code=400, detail="Cannot remove your own super_admin role")

    service = AdminService(db)
    user = await service.update_user(user_id, data, str(current_user.id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    current_user: UserDocument = Depends(require_super_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Suspend a user (soft delete)."""
    if user_id == current_user.uuid:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    service = AdminService(db)
    success = await service.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None
