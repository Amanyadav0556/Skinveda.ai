"""SkinVeda.ai — Mood Tracking Router"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.config.database import get_pool
from app.models.schemas import MoodCreate
from app.routers.auth import get_current_user

router = APIRouter()

def fmt_mood(row) -> dict:
    return {**dict(row), "id": str(row["id"]), "user_id": str(row["user_id"])}

@router.get("/")
async def list_moods(limit: int = 90, current_user=Depends(get_current_user)):
    rows = await get_pool().fetch(
        "select * from mood_logs where user_id = $1 order by timestamp desc limit $2",
        uuid.UUID(current_user["id"]), max(1, min(limit, 365)))
    return {"moods": [fmt_mood(r) for r in rows]}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_mood(data: MoodCreate, current_user=Depends(get_current_user)):
    row = await get_pool().fetchrow(
        """insert into mood_logs (user_id, mood, score, notes, tags)
           values ($1, $2, $3, $4, $5) returning *""",
        uuid.UUID(current_user["id"]), data.mood.value, data.score, data.notes, data.tags or [])
    return fmt_mood(row)

@router.delete("/{mood_id}")
async def delete_mood(mood_id: str, current_user=Depends(get_current_user)):
    try:
        mid = uuid.UUID(mood_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Mood log not found")
    result = await get_pool().execute("delete from mood_logs where id = $1 and user_id = $2",
                                      mid, uuid.UUID(current_user["id"]))
    if result.endswith(" 0"):
        raise HTTPException(status_code=404, detail="Mood log not found")
    return {"message": "Mood log deleted"}

@router.delete("/")
async def clear_moods(current_user=Depends(get_current_user)):
    result = await get_pool().execute("delete from mood_logs where user_id = $1", uuid.UUID(current_user["id"]))
    return {"message": "Mood history cleared", "deleted": int(result.split()[-1])}
