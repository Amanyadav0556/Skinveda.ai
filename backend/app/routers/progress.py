"""SkinVeda.ai — Progress Photos Router"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.config.database import get_pool
from app.models.schemas import ProgressPhotoCreate
from app.routers.auth import get_current_user

router = APIRouter()

def fmt_photo(row) -> dict:
    return {**dict(row), "id": str(row["id"]), "user_id": str(row["user_id"])}

@router.get("/photos")
async def list_photos(limit: int = 60, current_user=Depends(get_current_user)):
    rows = await get_pool().fetch(
        "select * from progress_photos where user_id = $1 order by timestamp desc limit $2",
        uuid.UUID(current_user["id"]), max(1, min(limit, 200)))
    return {"photos": [fmt_photo(r) for r in rows]}

@router.post("/photos", status_code=status.HTTP_201_CREATED)
async def add_photo(data: ProgressPhotoCreate, current_user=Depends(get_current_user)):
    row = await get_pool().fetchrow(
        "insert into progress_photos (user_id, image_data, body_region, notes) values ($1, $2, $3, $4) returning *",
        uuid.UUID(current_user["id"]), data.image_data, data.body_region, data.notes)
    return fmt_photo(row)

@router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, current_user=Depends(get_current_user)):
    try:
        pid = uuid.UUID(photo_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Photo not found")
    result = await get_pool().execute("delete from progress_photos where id = $1 and user_id = $2",
                                      pid, uuid.UUID(current_user["id"]))
    if result.endswith(" 0"):
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"message": "Photo deleted"}

@router.delete("/photos")
async def clear_photos(current_user=Depends(get_current_user)):
    result = await get_pool().execute("delete from progress_photos where user_id = $1", uuid.UUID(current_user["id"]))
    return {"message": "Progress photos cleared", "deleted": int(result.split()[-1])}
