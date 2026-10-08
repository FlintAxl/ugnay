import asyncio
import io
import logging
from typing import Optional
import cloudinary
import cloudinary.uploader
from app.config import settings

logger = logging.getLogger(__name__)

# Configure Cloudinary if credentials are present
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


class StorageService:
    @staticmethod
    async def upload_face_image(image_bytes: bytes, filename: str) -> str:
        """
        Uploads face selfie image to Cloudinary and returns the secure URL.
        Runs the blocking Cloudinary SDK call in a separate thread.
        """
        if not settings.CLOUDINARY_CLOUD_NAME:
            logger.warning("Cloudinary credentials not set. Returning placeholder URL.")
            return "https://res.cloudinary.com/demo/image/upload/sample.jpg"

        def _sync_upload():
            response = cloudinary.uploader.upload(
                io.BytesIO(image_bytes),
                folder=f"{settings.CLOUDINARY_UPLOAD_FOLDER}/faces",
                public_id=filename.rsplit(".", 1)[0],
                resource_type="image",
                overwrite=True,
            )
            return response.get("secure_url")

        try:
            url = await asyncio.to_thread(_sync_upload)
            return url
        except Exception as e:
            logger.error(f"Failed to upload image to Cloudinary: {e}")
            raise RuntimeError(f"Cloudinary upload failed: {str(e)}")


storage_service = StorageService()

