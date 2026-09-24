"""SkinVeda.ai — AI Diagnosis Router"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
import uuid
from typing import Optional
from app.config.database import get_pool
from app.routers.auth import get_current_user
from app.models.schemas import DiagnosisRecordCreate
from app.services.ai_service import run_inference
import cloudinary
import cloudinary.uploader
from app.config.settings import settings
import logging

router = APIRouter()
logger = logging.getLogger("skinveda.diagnosis")

cloudinary.config(cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                  api_key=settings.CLOUDINARY_API_KEY,
                  api_secret=settings.CLOUDINARY_API_SECRET)

DISEASE_DATA = {
    "eczema": {"description": "Chronic inflammatory skin condition causing itchy, inflamed skin.", "risk": "moderate",
               "recommendations": ["Moisturize with fragrance-free cream twice daily", "Avoid known triggers", "Apply topical corticosteroids as prescribed", "Use antihistamines for itching"]},
    "psoriasis": {"description": "Chronic autoimmune condition causing rapid skin cell buildup.", "risk": "moderate",
                  "recommendations": ["Use topical corticosteroids", "Try light therapy (phototherapy)", "Apply vitamin D analogues", "Avoid cold, dry weather"]},
    "vitiligo": {"description": "Depigmentation disorder where skin loses melanocytes.", "risk": "low",
                 "recommendations": ["Apply SPF 50+ sunscreen daily", "Avoid peak sun hours 10AM-4PM", "Consider topical calcineurin inhibitors", "Consult for light therapy options"]},
    "acne": {"description": "Common skin condition from clogged hair follicles.", "risk": "low",
             "recommendations": ["Use benzoyl peroxide or salicylic acid", "Apply topical retinoids", "Avoid touching face", "Change pillowcase frequently"]},
    "dermatitis": {"description": "Inflammatory skin reaction caused by contact with irritants.", "risk": "low",
                   "recommendations": ["Identify and avoid triggers", "Apply topical corticosteroids", "Use cool compresses", "Moisturize regularly"]},
}

@router.post("/analyze")
async def analyze_skin(
    image: UploadFile = File(..., description="Skin image for analysis"),
    body_region: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    current_user=Depends(get_current_user)
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Upload to Cloudinary
    try:
        contents = await image.read()
        upload_result = cloudinary.uploader.upload(contents, folder="skinveda/diagnoses", resource_type="image",
                                                    transformation=[{"width": 512, "height": 512, "crop": "fill"}])
        image_url = upload_result["secure_url"]
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")

    # Run AI inference
    try:
        prediction = await run_inference(contents)
    except Exception as e:
        logger.error(f"AI inference failed: {e}")
        raise HTTPException(status_code=500, detail="AI analysis failed")

    disease_key = prediction["disease"].lower().replace(" ", "_")
    disease_info = DISEASE_DATA.get(disease_key, DISEASE_DATA["eczema"])
    analysis_id = f"SVD-{uuid.uuid4().hex[:12].upper()}"

    # Save to DB
    new_id = await get_pool().fetchval(
        """insert into diagnoses (user_id, image_url, disease, confidence, risk_level, description,
               recommendations, symptoms, triggers, body_region, notes, ai_model_version, analysis_id)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning id""",
        uuid.UUID(current_user["id"]), image_url, prediction["disease"], prediction["confidence"],
        disease_info["risk"], disease_info["description"], disease_info["recommendations"],
        prediction.get("symptoms", []), prediction.get("triggers", []), body_region, notes,
        "SkinVeda-DINOv2-v2.1", analysis_id,
    )

    return {
        "id": str(new_id),
        "disease": prediction["disease"],
        "confidence": prediction["confidence"],
        "risk_level": disease_info["risk"],
        "description": disease_info["description"],
        "recommendations": disease_info["recommendations"],
        "body_region": body_region,
        "image_url": image_url,
        "analysis_id": analysis_id,
        "model_version": "SkinVeda-DINOv2-v2.1",
        "disclaimer": "This AI analysis is for informational purposes only and does not replace professional medical diagnosis.",
    }

@router.post("/records", status_code=201)
async def save_record(data: DiagnosisRecordCreate, current_user=Depends(get_current_user)):
    """Save an analysis produced in the app to the user's history."""
    row = await get_pool().fetchrow(
        """insert into diagnoses (user_id, disease, confidence, risk_level, description, recommendations,
               symptoms, triggers, body_region, notes, skin_score, metrics, concerns, image_data,
               ai_model_version, analysis_id, version, skin_type, summary, escalation)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
           returning *""",
        uuid.UUID(current_user["id"]), data.disease, data.confidence, data.risk_level, data.description,
        data.recommendations, data.symptoms, data.triggers, data.body_region, data.notes,
        data.skin_score, data.metrics, data.concerns, data.image_data,
        data.model_version or "SkinVeda-DINOv2-v2.1",
        data.analysis_id or f"SVD-{uuid.uuid4().hex[:12].upper()}",
        data.version, data.skin_type, data.summary, data.escalation,
    )
    return {**dict(row), "id": str(row["id"]), "user_id": str(row["user_id"])}

@router.get("/history")
async def get_history(limit: int = 20, skip: int = 0, current_user=Depends(get_current_user)):
    rows = await get_pool().fetch(
        "select * from diagnoses where user_id = $1 order by timestamp desc offset $2 limit $3",
        uuid.UUID(current_user["id"]), max(0, skip), max(1, min(limit, 100)))
    diagnoses = [{**dict(r), "id": str(r["id"]), "user_id": str(r["user_id"])} for r in rows]
    return {"diagnoses": diagnoses, "total": len(diagnoses)}

@router.delete("/")
async def clear_history(current_user=Depends(get_current_user)):
    result = await get_pool().execute("delete from diagnoses where user_id = $1", uuid.UUID(current_user["id"]))
    return {"message": "Diagnosis history cleared", "deleted": int(result.split()[-1])}

@router.delete("/{diagnosis_id}")
async def delete_diagnosis(diagnosis_id: str, current_user=Depends(get_current_user)):
    try:
        diag_id = uuid.UUID(diagnosis_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    result = await get_pool().execute("delete from diagnoses where id = $1 and user_id = $2",
                                      diag_id, uuid.UUID(current_user["id"]))
    if result.endswith(" 0"):
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return {"message": "Diagnosis deleted"}
