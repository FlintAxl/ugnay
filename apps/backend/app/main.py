from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ugnay")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Ugnay Backend Services...")
    await init_db()
    logger.info("Startup complete.")
    yield
    logger.info("Shutting down Ugnay Backend Services.")


app = FastAPI(
    title="Ugnay Cooperative API",
    version="1.0.0",
    description="Backend API for Ugnay Cooperative Management System",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows web admin and mobile app during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "system": "Ugnay Cooperative API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}