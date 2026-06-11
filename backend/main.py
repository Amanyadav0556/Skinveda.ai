"""
SkinVeda.ai — FastAPI Backend
Production-ready REST API with JWT auth, AI diagnosis, mood tracking, and environment monitoring.
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
import logging
from app.config.database import connect_to_mongo, close_mongo_connection
from app.config.settings import settings
from app.routers import auth, diagnosis, mood, environment, reports
from app.middleware.auth import AuthMiddleware

# Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("skinveda")

# App
app = FastAPI(
    title="SkinVeda.ai API",
    description="AI-powered chronic skin disease management platform — combining skin diagnosis, mood tracking, and environmental intelligence.",
    version="2.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(diagnosis.router, prefix="/api/diagnosis", tags=["AI Diagnosis"])
app.include_router(mood.router, prefix="/api/mood", tags=["Mood Tracking"])
app.include_router(environment.router, prefix="/api/environment", tags=["Environment"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# Lifecycle
@app.on_event("startup")
async def startup(): await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown(): await close_mongo_connection()

# Health
@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "version": "2.1.0", "service": "SkinVeda.ai API", "model": "DINOv2-v2.1"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
