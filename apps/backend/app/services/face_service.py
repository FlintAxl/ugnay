import hashlib
import io
import logging
import math
from typing import List, Optional, Tuple
import httpx
from PIL import Image
from app.config import settings

logger = logging.getLogger(__name__)


class FaceService:
    @staticmethod
    def _calculate_cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot_product / (norm_a * norm_b)

    @staticmethod
    def _generate_fallback_embedding(image_bytes: bytes) -> List[float]:
        """
        Generate a normalized 512-dimension deterministic vector for local dev/testing
        when the external face microservice is not yet running.
        """
        seed = hashlib.sha256(image_bytes).digest()
        embedding = []
        for i in range(512):
            byte_val = seed[i % len(seed)]
            val = ((byte_val ^ (i * 31 % 256)) / 128.0) - 1.0
            embedding.append(val)
        # Normalize vector
        norm = math.sqrt(sum(x * x for x in embedding)) or 1.0
        return [x / norm for x in embedding]

    @classmethod
    async def extract_face_embedding(cls, image_bytes: bytes) -> Tuple[bool, Optional[List[float]], str]:
        """
        Extract 512-d face embedding from uploaded image bytes.
        Returns: (is_success, embedding, message)
        """
        # 1. Validate image format with Pillow
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.verify()
        except Exception as e:
            return False, None, f"Invalid image file: {str(e)}"

        # 2. Try calling dedicated Face Service if running
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                files = {"file": ("face.jpg", image_bytes, "image/jpeg")}
                response = await client.post(f"{settings.FACE_SERVICE_URL}/extract", files=files)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("detected"):
                        return True, data.get("embedding"), "Face detected successfully"
                    return False, None, "No face detected in the image. Please take a clear frontal photo."
        except Exception:
            # Face service microservice is currently offline or unreachable
            logger.info("Face service unreachable at %s; fallback generator used.", settings.FACE_SERVICE_URL)

        # 3. Fallback generator for development
        fallback_emb = cls._generate_fallback_embedding(image_bytes)
        return True, fallback_emb, "Face processed successfully (dev mode)"

    @classmethod
    def verify_face_match(cls, stored_embedding: List[float], incoming_embedding: List[float], threshold: float = 0.6) -> Tuple[bool, float]:
        """
        Verify if two embeddings match using cosine similarity.
        """
        score = cls._calculate_cosine_similarity(stored_embedding, incoming_embedding)
        return (score >= threshold), score


face_service = FaceService()

