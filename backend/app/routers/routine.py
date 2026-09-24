"""SkinVeda.ai — Daily Routine Router"""
import uuid
from datetime import date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.config.database import get_pool
from app.routers.auth import get_current_user

router = APIRouter()

class RoutineUpdate(BaseModel):
    done_steps: List[str] = Field(default_factory=list, max_length=50)

@router.get("/")
async def routine_history(start: date, end: date, current_user=Depends(get_current_user)):
    """Checklist history between two days (inclusive), max 92 days — used for consistency charts."""
    if end < start or (end - start).days > 92:
        raise HTTPException(status_code=400, detail="Choose a range of up to 92 days")
    rows = await get_pool().fetch(
        "select day, done_steps from routine_logs where user_id = $1 and day between $2 and $3 order by day",
        uuid.UUID(current_user["id"]), start, end)
    return {"days": [{"day": r["day"].isoformat(), "done_steps": r["done_steps"]} for r in rows]}

@router.get("/{day}")
async def get_routine(day: date, current_user=Depends(get_current_user)):
    steps = await get_pool().fetchval(
        "select done_steps from routine_logs where user_id = $1 and day = $2",
        uuid.UUID(current_user["id"]), day)
    return {"day": day.isoformat(), "done_steps": steps or []}

@router.put("/{day}")
async def save_routine(day: date, data: RoutineUpdate, current_user=Depends(get_current_user)):
    steps = sorted(set(data.done_steps))
    await get_pool().execute(
        """insert into routine_logs (user_id, day, done_steps) values ($1, $2, $3)
           on conflict (user_id, day) do update set done_steps = excluded.done_steps, updated_at = now()""",
        uuid.UUID(current_user["id"]), day, steps)
    return {"day": day.isoformat(), "done_steps": steps}
