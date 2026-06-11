"""SkinVeda.ai — MongoDB Connection"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.settings import settings

logger = logging.getLogger("skinveda")
client: AsyncIOMotorClient = None

async def connect_to_mongo():
    global client
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        await client.admin.command("ping")
        logger.info("✅ Connected to MongoDB Atlas")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed")

def get_db():
    return client[settings.MONGODB_DB]

def get_collection(name: str):
    return get_db()[name]
