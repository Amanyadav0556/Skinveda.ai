"""SkinVeda.ai — Dermatologist consultation requests"""
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.config.database import get_pool
from app.routers.auth import get_current_user

router = APIRouter()

class AppointmentCreate(BaseModel):
    doctor_id: str = Field(..., min_length=1, max_length=60)
    doctor_name: str = Field(..., min_length=1, max_length=120)
    mode: Literal["video", "chat", "clinic"]
    slot: datetime
    fee: Optional[int] = Field(None, ge=0, le=100000)
    notes: Optional[str] = Field(None, max_length=1000)
    scan_id: Optional[uuid.UUID] = None

def fmt(row) -> dict:
    d = dict(row)
    d["id"] = str(d["id"]); d["user_id"] = str(d["user_id"])
    d["scan_id"] = str(d["scan_id"]) if d.get("scan_id") else None
    return d

@router.get("/")
async def list_appointments(current_user=Depends(get_current_user)):
    rows = await get_pool().fetch(
        "select * from appointments where user_id = $1 order by slot desc limit 100", uuid.UUID(current_user["id"]))
    return {"appointments": [fmt(r) for r in rows]}

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_appointment(data: AppointmentCreate, current_user=Depends(get_current_user)):
    slot = data.slot if data.slot.tzinfo else data.slot.replace(tzinfo=timezone.utc)
    if slot <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Please choose a time in the future")
    uid = uuid.UUID(current_user["id"])
    pool = get_pool()
    clash = await pool.fetchval(
        "select 1 from appointments where user_id = $1 and doctor_id = $2 and slot = $3 and status <> 'cancelled'",
        uid, data.doctor_id, slot)
    if clash:
        raise HTTPException(status_code=409, detail="You already have a request for this time")
    row = await pool.fetchrow(
        """insert into appointments (user_id, doctor_id, doctor_name, mode, slot, fee, notes, scan_id)
           values ($1, $2, $3, $4, $5, $6, $7, $8) returning *""",
        uid, data.doctor_id, data.doctor_name, data.mode, slot, data.fee, data.notes, data.scan_id)
    return fmt(row)

@router.post("/{appointment_id}/cancel")
async def cancel_appointment(appointment_id: str, current_user=Depends(get_current_user)):
    try:
        aid = uuid.UUID(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")
    row = await get_pool().fetchrow(
        "update appointments set status = 'cancelled' where id = $1 and user_id = $2 returning *",
        aid, uuid.UUID(current_user["id"]))
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return fmt(row)
