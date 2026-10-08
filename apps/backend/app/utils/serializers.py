from typing import Any, Dict
from app.models.user import ApprovalInfo, FaceData, UserResponse


def user_doc_to_response(doc: Dict[str, Any]) -> UserResponse:
    """Format MongoDB user document to UserResponse Pydantic model."""
    face_raw = doc.get("face_data") or {}
    approval_raw = doc.get("approval") or {}

    return UserResponse(
        id=str(doc["_id"]),
        full_name=doc.get("full_name", ""),
        email=doc.get("email", ""),
        phone=doc.get("phone"),
        role=doc.get("role"),
        status=doc.get("status"),
        face_data=FaceData(
            is_registered=face_raw.get("is_registered", False),
            image_url=face_raw.get("image_url"),
            embedding=None,  # Do not expose raw vector in API responses
            registered_at=face_raw.get("registered_at"),
        ),
        approval=ApprovalInfo(
            approved_by=str(approval_raw.get("approved_by")) if approval_raw.get("approved_by") else None,
            approved_at=approval_raw.get("approved_at"),
            rejection_reason=approval_raw.get("rejection_reason"),
        ),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )

