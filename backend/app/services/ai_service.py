"""SkinVeda.ai — AI Service (inference wrapper)"""
import asyncio
import logging
from ai.model import SkinVedaInferenceEngine
from app.config.settings import settings

logger = logging.getLogger("skinveda.ai")

# Singleton inference engine
_engine: SkinVedaInferenceEngine = None

def get_engine() -> SkinVedaInferenceEngine:
    global _engine
    if _engine is None:
        _engine = SkinVedaInferenceEngine(model_path=settings.MODEL_PATH)
    return _engine

async def run_inference(image_bytes: bytes) -> dict:
    """Run AI inference asynchronously (non-blocking)."""
    loop = asyncio.get_event_loop()
    engine = get_engine()
    # Run CPU-bound inference in thread pool to avoid blocking event loop
    result = await loop.run_in_executor(None, engine.predict, image_bytes)
    logger.info(f"Inference complete: {result['disease']} ({result['confidence']:.2%})")
    return result
