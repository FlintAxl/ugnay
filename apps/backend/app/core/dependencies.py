from typing import List
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_token
from app.database import get_db
from app.models.user import UserRole, UserStatus

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db=Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if not payload:
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})

    if not user:
        raise credentials_exception

    return user


async def get_current_active_user(user: dict = Depends(get_current_user)):
    user_status = user.get("status")
    if user_status == UserStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is currently pending administrator approval.",
        )
    if user_status == UserStatus.REJECTED:
        reason = user.get("approval", {}).get("rejection_reason", "No reason provided")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account registration was rejected: {reason}",
        )
    if user_status == UserStatus.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been suspended. Please contact support.",
        )
    return user


async def require_admin(user: dict = Depends(get_current_active_user)):
    if user.get("role") != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )
    return user


def require_roles(allowed_roles: List[UserRole]):
    async def role_checker(user: dict = Depends(get_current_active_user)):
        if user.get("role") not in allowed_roles and user.get("role") != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied for role: {user.get('role')}",
            )
        return user
    return role_checker

