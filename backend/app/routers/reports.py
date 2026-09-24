from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_reports():
    return {"status": "ok", "message": "Reports router active"}
