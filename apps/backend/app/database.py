import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.core.security import hash_password

logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]


def get_db():
    return db


async def init_db():
    """Ensure database indexes and seed default admin if not existing."""
    try:
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        await db.users.create_index("status")
        await db.users.create_index("created_at")
        logger.info("MongoDB indexes verified successfully.")

        # Seed default admin if none exists
        admin_exists = await db.users.find_one({"role": "admin"})
        if not admin_exists:
            now = datetime.now(timezone.utc)
            admin_doc = {
                "full_name": "System Administrator",
                "email": "admin@ugnay.coop",
                "phone": "+639000000000",
                "hashed_password": hash_password("AdminPassword123!"),
                "role": "admin",
                "status": "active",
                "face_data": {
                    "is_registered": True,
                    "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                    "embedding": [],
                    "registered_at": now,
                },
                "approval": {
                    "approved_by": "SYSTEM",
                    "approved_at": now,
                    "rejection_reason": None,
                },
                "created_at": now,
                "updated_at": now,
            }
            await db.users.insert_one(admin_doc)
            logger.info("Default administrator seeded: admin@ugnay.coop / AdminPassword123!")

    except Exception as e:
        logger.error(f"Error during database initialization: {e}")