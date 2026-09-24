"""SkinVeda.ai — PostgreSQL (Supabase) connection"""
import logging
import asyncpg
from fastapi import HTTPException, status
from app.config.settings import settings

logger = logging.getLogger("skinveda")
pool: asyncpg.Pool | None = None

DB_UNAVAILABLE = "Database unavailable — check DATABASE_URL in backend/.env."

SCHEMA = """
create table if not exists users (
    id             uuid primary key default gen_random_uuid(),
    name           text not null,
    email          text not null unique,
    password       text not null,
    age            int,
    gender         text,
    location       text,
    skin_condition text,
    skin_type      text,
    role           text not null default 'user',
    streak         int  not null default 0,
    joined_at      timestamptz not null default now(),
    last_login     timestamptz
);

create table if not exists diagnoses (
    id               uuid primary key default gen_random_uuid(),
    user_id          uuid not null references users(id) on delete cascade,
    image_url        text,
    disease          text not null,
    confidence       real not null,
    risk_level       text,
    description      text,
    recommendations  jsonb not null default '[]',
    symptoms         jsonb not null default '[]',
    triggers         jsonb not null default '[]',
    body_region      text,
    notes            text,
    ai_model_version text,
    analysis_id      text,
    timestamp        timestamptz not null default now()
);
create index if not exists diagnoses_user_ts on diagnoses (user_id, timestamp desc);
-- Fields shown by the redesigned report screens
alter table diagnoses add column if not exists skin_score int;
alter table diagnoses add column if not exists metrics    jsonb not null default '{}';
alter table diagnoses add column if not exists concerns   jsonb not null default '[]';
alter table diagnoses add column if not exists image_data text;

create table if not exists mood_logs (
    id        uuid primary key default gen_random_uuid(),
    user_id   uuid not null references users(id) on delete cascade,
    mood      text not null,
    score     int  not null check (score between 1 and 10),
    notes     text,
    tags      jsonb not null default '[]',
    timestamp timestamptz not null default now()
);
create index if not exists mood_logs_user_ts on mood_logs (user_id, timestamp desc);
alter table mood_logs enable row level security;

create table if not exists progress_photos (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users(id) on delete cascade,
    image_data  text not null,
    body_region text,
    notes       text,
    timestamp   timestamptz not null default now()
);
create index if not exists progress_photos_user_ts on progress_photos (user_id, timestamp desc);
alter table progress_photos enable row level security;

-- One row per user per day: which AM/PM routine steps were ticked off
create table if not exists routine_logs (
    user_id    uuid not null references users(id) on delete cascade,
    day        date not null,
    done_steps jsonb not null default '[]',
    updated_at timestamptz not null default now(),
    primary key (user_id, day)
);
alter table routine_logs enable row level security;

-- Supabase exposes the public schema through its REST API. Enabling RLS with
-- no policies blocks that path (password hashes stay private); this backend
-- connects as the postgres role, which bypasses RLS.
alter table users enable row level security;
alter table diagnoses enable row level security;
"""

# Errors meaning the pooled connection died (Supabase/network closed it while idle).
# The query never ran, so retrying once on a fresh connection is safe.
_DEAD_CONNECTION = (asyncpg.ConnectionDoesNotExistError, asyncpg.InterfaceError, ConnectionResetError, OSError)

class _RetryingPool:
    """Wraps asyncpg.Pool: retries a query once if its connection was dropped."""
    def __init__(self, inner: asyncpg.Pool):
        self._inner = inner

    async def _run(self, method: str, *args):
        for attempt in (1, 2):
            try:
                return await getattr(self._inner, method)(*args)
            except _DEAD_CONNECTION as e:
                if attempt == 2:
                    raise
                logger.warning(f"DB connection dropped ({type(e).__name__}); retrying once")

    async def fetch(self, *args):    return await self._run("fetch", *args)
    async def fetchrow(self, *args): return await self._run("fetchrow", *args)
    async def fetchval(self, *args): return await self._run("fetchval", *args)
    async def execute(self, *args):  return await self._run("execute", *args)
    def acquire(self):               return self._inner.acquire()

async def _init_connection(conn):
    import json
    await conn.set_type_codec("jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog")

async def connect_db():
    global pool
    if not settings.DATABASE_URL:
        logger.error("❌ DATABASE_URL is not set in backend/.env")
        return
    try:
        # statement_cache_size=0 keeps this compatible with Supabase's pgbouncer pooler
        # max_inactive_connection_lifetime: recycle idle connections before the server drops them
        pool = await asyncpg.create_pool(settings.DATABASE_URL, min_size=1, max_size=5,
                                         statement_cache_size=0, init=_init_connection, timeout=15,
                                         max_inactive_connection_lifetime=60)
        async with pool.acquire() as conn:
            await conn.execute(SCHEMA)
        logger.info("✅ Connected to PostgreSQL (Supabase); schema ready")
    except Exception as e:
        pool = None
        logger.error(f"❌ Database connection failed: {type(e).__name__}: {e}")

async def close_db():
    global pool
    if pool:
        await pool.close()
        logger.info("Database pool closed")

def get_pool() -> _RetryingPool:
    if pool is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=DB_UNAVAILABLE)
    return _RetryingPool(pool)
