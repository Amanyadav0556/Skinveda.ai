"""SkinVeda.ai — Auth Router"""
import uuid
import logging
from datetime import datetime, timedelta, timezone

import asyncpg
import bcrypt
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.config.database import get_pool
from app.config.settings import settings
from app.models.schemas import UserCreate, UserLogin, UserUpdate, UserResponse, TokenResponse

router = APIRouter()
bearer = HTTPBearer()
logger = logging.getLogger("skinveda.auth")

USER_COLUMNS = "id, name, email, age, gender, location, skin_condition, skin_type, role, streak, joined_at"

# bcrypt used directly: passlib 1.7.4 is incompatible with bcrypt >= 4.1 and
# crashes on every hash. bcrypt only reads the first 72 bytes of a password.
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode("utf-8")[:72], h.encode("utf-8"))
    except ValueError:
        return False

def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def fmt_user(row) -> dict:
    u = dict(row)
    u["id"] = str(u["id"])
    u.pop("password", None)
    return u

async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = uuid.UUID(payload.get("sub", ""))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    row = await get_pool().fetchrow(f"select {USER_COLUMNS} from users where id = $1", user_id)
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return fmt_user(row)

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate):
    email = data.email.lower()
    try:
        row = await get_pool().fetchrow(
            f"""insert into users (name, email, password, age, gender, location, skin_condition, skin_type)
                values ($1, $2, $3, $4, $5, $6, $7, $8)
                returning {USER_COLUMNS}""",
            data.name.strip(), email, hash_password(data.password), data.age,
            data.gender.value if data.gender else None, data.location, data.skin_condition, data.skin_type,
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = fmt_user(row)
    logger.info(f"New user registered: {email}")
    return {"access_token": create_token(user["id"]), "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    db = get_pool()
    row = await db.fetchrow(f"select {USER_COLUMNS}, password from users where email = $1", data.email.lower())
    if not row or not verify_password(data.password, row["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    row = await db.fetchrow(
        f"update users set streak = streak + 1, last_login = now() where id = $1 returning {USER_COLUMNS}", row["id"])
    user = fmt_user(row)
    return {"access_token": create_token(user["id"]), "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(updates: UserUpdate, current_user=Depends(get_current_user)):
    fields = updates.model_dump(exclude_unset=True)
    if "gender" in fields and fields["gender"] is not None:
        fields["gender"] = fields["gender"].value
    if "name" in fields and fields["name"]:
        fields["name"] = fields["name"].strip()
    if not fields:
        return current_user
    keys = list(fields)
    sets = ", ".join(f"{k} = ${i + 2}" for i, k in enumerate(keys))
    row = await get_pool().fetchrow(
        f"update users set {sets} where id = $1 returning {USER_COLUMNS}",
        uuid.UUID(current_user["id"]), *[fields[k] for k in keys])
    return fmt_user(row)

@router.post("/logout")
async def logout(current_user=Depends(get_current_user)):
    return {"message": "Logged out successfully"}
