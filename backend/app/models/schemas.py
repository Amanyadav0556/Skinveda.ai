"""SkinVeda.ai — Pydantic Models"""
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
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

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=10, le=120)
    gender: Optional[Gender] = None
    location: Optional[str] = Field(None, max_length=100)
    skin_condition: Optional[str] = Field(None, max_length=60)
    skin_type: Optional[str] = Field(None, max_length=30)

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

class DiagnosisRecordCreate(BaseModel):
    """A skin analysis produced in the app, saved to the user's history."""
    model_config = ConfigDict(protected_namespaces=())  # allow the `model_version` field name

    disease: str = Field(..., min_length=1, max_length=100)
    confidence: float = Field(..., ge=0, le=1)
    risk_level: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=2000)
    recommendations: List[str] = []
    symptoms: List[str] = []
    triggers: List[str] = []
    body_region: Optional[str] = Field(None, max_length=60)
    notes: Optional[str] = Field(None, max_length=1000)
    skin_score: Optional[int] = Field(None, ge=0, le=100)
    metrics: Dict[str, int] = {}
    concerns: List[Dict[str, Any]] = []
    image_data: Optional[str] = Field(None, max_length=1_500_000)
    model_version: Optional[str] = Field(None, max_length=60)
    analysis_id: Optional[str] = Field(None, max_length=60)

    @field_validator("image_data")
    @classmethod
    def must_be_image_data_url(cls, v):
        if v is not None and not v.startswith("data:image/"):
            raise ValueError("image_data must be a data:image/... URL")
        return v

class ProgressPhotoCreate(BaseModel):
    image_data: str = Field(..., max_length=1_500_000)
    body_region: Optional[str] = Field(None, max_length=60)
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator("image_data")
    @classmethod
    def must_be_image_data_url(cls, v):
        if not v.startswith("data:image/"):
            raise ValueError("image_data must be a data:image/... URL")
        return v

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
