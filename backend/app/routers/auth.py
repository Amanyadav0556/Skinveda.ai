"""SkinVeda.ai — Auth Router"""
from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from bson import ObjectId
from app.config.database import get_collection
from app.config.settings import settings
from app.models.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
import logging

router = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()
logger = logging.getLogger("skinveda.auth")

def hash_password(p): return pwd_ctx.hash(p)
def verify_password(p, h): return pwd_ctx.verify(p, h)

def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id: raise HTTPException(status_code=401, detail="Invalid token")
        col = get_collection("users")
        user = await col.find_one({"_id": ObjectId(user_id)})
        if not user: raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user["_id"])
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")

def fmt_user(u):
    return {"id": str(u["_id"]), "name": u["name"], "email": u["email"], "age": u.get("age"),
            "gender": u.get("gender"), "location": u.get("location"), "skin_condition": u.get("skin_condition"),
            "skin_type": u.get("skin_type"), "role": u.get("role", "user"), "streak": u.get("streak", 0),
            "joined_at": u.get("joined_at", datetime.utcnow())}

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
    col = get_collection("users")
    if await col.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {**data.dict(), "password": hash_password(data.password), "role": "user", "streak": 0,
           "joined_at": datetime.utcnow(), "created_at": datetime.utcnow()}
    result = await col.insert_one(doc)
    doc["_id"] = result.inserted_id
    token = create_token(str(result.inserted_id))
    logger.info(f"New user registered: {data.email}")
    return {"access_token": token, "token_type": "bearer", "user": fmt_user(doc)}

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    col = get_collection("users")
    user = await col.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Update streak
    await col.update_one({"_id": user["_id"]}, {"$inc": {"streak": 1}, "$set": {"last_login": datetime.utcnow()}})
    token = create_token(str(user["_id"]))
    return {"access_token": token, "token_type": "bearer", "user": fmt_user(user)}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return fmt_user(current_user)

@router.put("/profile")
async def update_profile(updates: dict, current_user=Depends(get_current_user)):
    allowed = {"name", "age", "gender", "location", "skin_condition", "skin_type"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    col = get_collection("users")
    await col.update_one({"_id": current_user["_id"]}, {"$set": filtered})
    return {"message": "Profile updated successfully"}

@router.post("/logout")
async def logout(current_user=Depends(get_current_user)):
    return {"message": "Logged out successfully"}
