"""SkinVeda.ai — AI Diagnosis Router"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from datetime import datetime
from bson import ObjectId
from typing import Optional
from app.config.database import get_collection
from app.routers.auth import get_current_user
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
    analysis_id = f"SVD-{ObjectId()}"

    # Save to DB
    doc = {
        "user_id": ObjectId(current_user["id"]),
        "image_url": image_url,
        "disease": prediction["disease"],
        "confidence": prediction["confidence"],
        "risk_level": disease_info["risk"],
        "description": disease_info["description"],
        "recommendations": disease_info["recommendations"],
        "symptoms": prediction.get("symptoms", []),
        "triggers": prediction.get("triggers", []),
        "body_region": body_region,
        "notes": notes,
        "ai_model_version": "SkinVeda-DINOv2-v2.1",
        "analysis_id": analysis_id,
        "timestamp": datetime.utcnow(),
    }
    col = get_collection("diagnoses")
    result = await col.insert_one(doc)
    doc["_id"] = result.inserted_id

    return {
        "id": str(doc["_id"]),
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

@router.get("/history")
async def get_history(limit: int = 20, skip: int = 0, current_user=Depends(get_current_user)):
    col = get_collection("diagnoses")
    cursor = col.find({"user_id": ObjectId(current_user["id"])}).sort("timestamp", -1).skip(skip).limit(limit)
    diagnoses = []
    async for d in cursor:
        d["id"] = str(d.pop("_id")); d["user_id"] = str(d["user_id"])
        diagnoses.append(d)
    return {"diagnoses": diagnoses, "total": len(diagnoses)}

@router.delete("/{diagnosis_id}")
async def delete_diagnosis(diagnosis_id: str, current_user=Depends(get_current_user)):
    col = get_collection("diagnoses")
    result = await col.delete_one({"_id": ObjectId(diagnosis_id), "user_id": ObjectId(current_user["id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return {"message": "Diagnosis deleted"}
