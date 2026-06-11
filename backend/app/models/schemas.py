"""SkinVeda.ai — Pydantic Models"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Gender(str, Enum):
    male = "Male"; female = "Female"; nonbinary = "Non-binary"; prefer_not = "Prefer not to say"

class Role(str, Enum):
    user = "user"; admin = "admin"

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    age: Optional[int] = Field(None, ge=10, le=120)
    gender: Optional[Gender] = None
    location: Optional[str] = None
    skin_condition: Optional[str] = None
    skin_type: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    location: Optional[str] = None
    skin_condition: Optional[str] = None
    skin_type: Optional[str] = None
    role: Role = Role.user
    streak: int = 0
    joined_at: datetime
    class Config: from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ── Diagnosis ─────────────────────────────────────────────────────────
class RiskLevel(str, Enum):
    low = "low"; moderate = "moderate"; high = "high"; severe = "severe"

class DiagnosisResponse(BaseModel):
    id: str
    user_id: str
    image_url: str
    disease: str
    confidence: float = Field(..., ge=0, le=1)
    risk_level: RiskLevel
    description: str
    recommendations: List[str]
    symptoms: List[str]
    triggers: List[str]
    body_region: Optional[str] = None
    ai_model_version: str
    analysis_id: str
    timestamp: datetime

# ── Mood ──────────────────────────────────────────────────────────────
class MoodType(str, Enum):
    happy = "happy"; calm = "calm"; sad = "sad"; anxious = "anxious"; stressed = "stressed"; angry = "angry"

class MoodCreate(BaseModel):
    mood: MoodType
    score: int = Field(..., ge=1, le=10)
    notes: Optional[str] = Field(None, max_length=1000)
    tags: Optional[List[str]] = []

class MoodResponse(BaseModel):
    id: str
    user_id: str
    mood: MoodType
    score: int
    notes: Optional[str] = None
    tags: List[str] = []
    timestamp: datetime

# ── Environment ───────────────────────────────────────────────────────
class EnvironmentResponse(BaseModel):
    city: str
    country: str
    temperature: float
    humidity: float
    aqi: int
    uv_index: float
    weather: str
    skin_risk_score: int = Field(..., ge=1, le=10)
    alerts: List[str]
    timestamp: datetime
