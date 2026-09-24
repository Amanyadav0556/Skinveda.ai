from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_environment():
    return {"status": "ok", "message": "Environment router active"}
