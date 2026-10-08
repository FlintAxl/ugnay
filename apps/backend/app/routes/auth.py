from datetime import datetime, timezone
import json
import logging
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from app.core.dependencies import get_current_active_user, get_current_user
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.database import get_db
from app.models.user import (
    FaceData,
    TokenResponse,
    UserLoginRequest,
    UserResponse,
    UserRole,
    UserStatus,
)
from app.services.face_service import face_service
from app.services.storage_service import storage_service
from app.utils.serializers import user_doc_to_response

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    full_name: str = Form(..., min_length=2, max_length=100),
    email: str = Form(...),
    password: str = Form(..., min_length=6),
    role: Optional[UserRole] = Form(None),
    phone: Optional[str] = Form(None),
    face_image: Optional[UploadFile] = File(None),
    db=Depends(get_db),
):
    """
    Register a new user with optional/required facial capture.
    Newly registered accounts default to 'pending' status without a final role assigned.
    The cooperative admin assigns the operational role upon approval.
    """
    cleaned_email = email.strip().lower()

    # Prevent registration directly as Admin from mobile
    if role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be self-registered via public registration.",
        )

    # Check if email is already registered
    existing_user = await db.users.find_one({"email": cleaned_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Process facial registration if face image is uploaded
    face_data = {
        "is_registered": False,
        "image_url": None,
        "embedding": [],
        "registered_at": None,
    }

    if face_image:
        image_bytes = await face_image.read()
        if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Facial image must be smaller than 10MB.",
            )

        # Extract face features & validate presence
        success, embedding, msg = await face_service.extract_face_embedding(image_bytes)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Facial registration failed: {msg}",
            )

        # Upload selfie photo to Cloudinary
        filename = f"face_{cleaned_email.replace('@', '_').replace('.', '_')}_{int(datetime.now().timestamp())}.jpg"
        try:
            image_url = await storage_service.upload_face_image(image_bytes, filename)
        except Exception as e:
            logger.error(f"Image storage failed: {e}")
            image_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"

        now = datetime.now(timezone.utc)
        face_data = {
            "is_registered": True,
            "image_url": image_url,
            "embedding": embedding or [],
            "registered_at": now,
        }

    now = datetime.now(timezone.utc)
    user_doc = {
        "full_name": full_name.strip(),
        "email": cleaned_email,
        "phone": phone.strip() if phone else None,
        "hashed_password": hash_password(password),
        "role": role.value if role else None,
        "status": UserStatus.PENDING.value,
        "face_data": face_data,
        "approval": {
            "approved_by": None,
            "approved_at": None,
            "rejection_reason": None,
        },
        "created_at": now,
        "updated_at": now,
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Record audit log
    await db.audit_logs.insert_one({
        "action": "USER_REGISTERED",
        "actor_id": str(result.inserted_id),
        "target_id": str(result.inserted_id),
        "details": {
            "email": cleaned_email,
            "role": role.value if role else None,
            "face_registered": face_data["is_registered"],
        },
        "timestamp": now,
    })

    return user_doc_to_response(user_doc)


@router.post("/login", response_model=TokenResponse)
async def login_user(payload: UserLoginRequest, db=Depends(get_db)):
    """
    Standard email/password login.
    Enforces status checking: only 'active' users can log in.
    """
    cleaned_email = payload.email.strip().lower()
    user = await db.users.find_one({"email": cleaned_email})

    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    # Check approval status
    user_status = user.get("status")
    if user_status == UserStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Your registration is currently pending administrator approval.",
                "status": "pending",
            },
        )

    if user_status == UserStatus.REJECTED.value:
        reason = user.get("approval", {}).get("rejection_reason", "No reason specified")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": f"Your registration was rejected: {reason}",
                "status": "rejected",
                "rejection_reason": reason,
            },
        )

    if user_status == UserStatus.SUSPENDED.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": "Your account has been suspended. Please contact the cooperative admin.",
                "status": "suspended",
            },
        )

    # Issue JWT tokens
    token_data = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "status": user["status"],
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Update last login timestamp
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login_at": datetime.now(timezone.utc)}}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_doc_to_response(user),
    )


@router.post("/face-login", response_model=TokenResponse)
async def face_login(
    email: Optional[str] = Form(None),
    face_image: UploadFile = File(...),
    db=Depends(get_db),
):
    """
    Facial authentication login.
    Matches uploaded face against stored 512-d vector.
    """
    image_bytes = await face_image.read()
    success, query_embedding, msg = await face_service.extract_face_embedding(image_bytes)

    if not success or not query_embedding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Face recognition error: {msg}",
        )

    target_user = None

    if email:
        cleaned_email = email.strip().lower()
        user = await db.users.find_one({"email": cleaned_email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email not found.",
            )
        stored_emb = user.get("face_data", {}).get("embedding")
        if not stored_emb:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No facial credentials registered for this account.",
            )

        is_match, score = face_service.verify_face_match(stored_emb, query_embedding)
        if not is_match:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Face verification failed. Match confidence too low ({score:.2f}).",
            )
        target_user = user
    else:
        # Search across active users with registered faces
        cursor = db.users.find({
            "status": UserStatus.ACTIVE.value,
            "face_data.is_registered": True,
        })
        best_match_user = None
        best_score = 0.0

        async for candidate in cursor:
            stored_emb = candidate.get("face_data", {}).get("embedding")
            if stored_emb:
                is_match, score = face_service.verify_face_match(stored_emb, query_embedding)
                if is_match and score > best_score:
                    best_score = score
                    best_match_user = candidate

        if not best_match_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Face not recognized or matching account is not active.",
            )
        target_user = best_match_user

    # Verify status
    if target_user.get("status") != UserStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active or awaiting administrator approval.",
        )

    token_data = {
        "sub": str(target_user["_id"]),
        "email": target_user["email"],
        "role": target_user["role"],
        "status": target_user["status"],
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user_doc_to_response(target_user),
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: dict = Depends(get_current_active_user)):
    """Retrieve profile of currently authenticated user."""
    return user_doc_to_response(user)

