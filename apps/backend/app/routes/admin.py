from datetime import datetime, timezone
import logging
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from app.core.dependencies import require_admin
from app.database import get_db
from app.models.user import ApproveRegistrationRequest, UserResponse, UserRole, UserStatus
from app.utils.serializers import user_doc_to_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin Management"])


class RejectionRequest(BaseModel):
    reason: str


class UpdateStatusRequest(BaseModel):
    status: UserStatus
    reason: Optional[str] = None


@router.get("/stats")
async def get_admin_dashboard_stats(admin: dict = Depends(require_admin), db=Depends(get_db)):
    """Summary metrics for the Web Admin dashboard."""
    total_users = await db.users.count_documents({})
    pending_count = await db.users.count_documents({"status": UserStatus.PENDING.value})
    active_count = await db.users.count_documents({"status": UserStatus.ACTIVE.value})
    rejected_count = await db.users.count_documents({"status": UserStatus.REJECTED.value})

    # Group counts by role
    role_counts = {}
    for role_enum in UserRole:
        count = await db.users.count_documents({"role": role_enum.value})
        role_counts[role_enum.value] = count

    return {
        "total_users": total_users,
        "pending_count": pending_count,
        "active_count": active_count,
        "rejected_count": rejected_count,
        "by_role": role_counts,
    }


@router.get("/pending-registrations", response_model=List[UserResponse])
async def list_pending_registrations(admin: dict = Depends(require_admin), db=Depends(get_db)):
    """List all accounts awaiting administrator approval."""
    cursor = db.users.find({"status": UserStatus.PENDING.value}).sort("created_at", -1)
    users = []
    async for doc in cursor:
        users.append(user_doc_to_response(doc))
    return users


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = None,
    user_status: Optional[UserStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    admin: dict = Depends(require_admin),
    db=Depends(get_db),
):
    """List cooperative users with optional role, status, and search filters."""
    query = {}
    if role:
        query["role"] = role.value
    if user_status:
        query["status"] = user_status.value
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = []
    async for doc in cursor:
        users.append(user_doc_to_response(doc))
    return users


@router.patch("/registrations/{user_id}/approve", response_model=UserResponse)
async def approve_user_registration(
    user_id: str,
    payload: ApproveRegistrationRequest,
    admin: dict = Depends(require_admin),
    db=Depends(get_db),
):
    """
    Approve a pending user registration and assign their operational role (logistics, production, etc.).
    """
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    now = datetime.now(timezone.utc)
    update_data = {
        "role": payload.role.value,
        "status": UserStatus.ACTIVE.value,
        "approval.approved_by": admin.get("email"),
        "approval.approved_at": now,
        "approval.rejection_reason": None,
        "updated_at": now,
    }

    await db.users.update_one({"_id": oid}, {"$set": update_data})
    updated_user = await db.users.find_one({"_id": oid})

    # Log audit event
    await db.audit_logs.insert_one({
        "action": "USER_APPROVED",
        "actor_id": str(admin["_id"]),
        "target_id": str(oid),
        "details": {
            "email": user["email"],
            "assigned_role": payload.role.value,
            "approved_by": admin["email"],
        },
        "timestamp": now,
    })

    return user_doc_to_response(updated_user)


@router.patch("/registrations/{user_id}/reject", response_model=UserResponse)
async def reject_user_registration(
    user_id: str,
    payload: RejectionRequest,
    admin: dict = Depends(require_admin),
    db=Depends(get_db),
):
    """
    Reject a pending user registration with an explanation reason.
    """
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    now = datetime.now(timezone.utc)
    update_data = {
        "status": UserStatus.REJECTED.value,
        "approval.approved_by": admin.get("email"),
        "approval.approved_at": now,
        "approval.rejection_reason": payload.reason.strip(),
        "updated_at": now,
    }

    await db.users.update_one({"_id": oid}, {"$set": update_data})
    updated_user = await db.users.find_one({"_id": oid})

    # Log audit event
    await db.audit_logs.insert_one({
        "action": "USER_REJECTED",
        "actor_id": str(admin["_id"]),
        "target_id": str(oid),
        "details": {
            "email": user["email"],
            "role": user["role"],
            "reason": payload.reason.strip(),
            "rejected_by": admin["email"],
        },
        "timestamp": now,
    })

    return user_doc_to_response(updated_user)


@router.patch("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    payload: UpdateStatusRequest,
    admin: dict = Depends(require_admin),
    db=Depends(get_db),
):
    """Change user status (active, suspended, etc.)."""
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user ID format.")

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    now = datetime.now(timezone.utc)
    update_data = {
        "status": payload.status.value,
        "updated_at": now,
    }
    if payload.reason:
        update_data["approval.rejection_reason"] = payload.reason

    await db.users.update_one({"_id": oid}, {"$set": update_data})
    updated_user = await db.users.find_one({"_id": oid})

    return user_doc_to_response(updated_user)

