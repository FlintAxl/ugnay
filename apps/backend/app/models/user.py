from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    ADMIN = "admin"
    LOGISTICS = "logistics"
    PRODUCTION = "production"
    MARKETING = "marketing"
    MICROFINANCE = "microfinance"
    SAVINGS = "savings"


class UserStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class FaceData(BaseModel):
    is_registered: bool = False
    image_url: Optional[str] = None
    embedding: Optional[List[float]] = None
    registered_at: Optional[datetime] = None


class ApprovalInfo(BaseModel):
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None


class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[UserRole] = None  # Admin assigns the actual role on approval


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserFaceLoginRequest(BaseModel):
    email: Optional[EmailStr] = None


class ApproveRegistrationRequest(BaseModel):
    role: UserRole = Field(..., description="Role assigned to the user by the administrator")


class UserApprovalAction(BaseModel):
    status: UserStatus
    rejection_reason: Optional[str] = None
    role: Optional[UserRole] = None


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    status: UserStatus
    face_data: FaceData
    approval: ApprovalInfo
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse
