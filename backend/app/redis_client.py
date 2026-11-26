import json
import logging
import time
from typing import Any
import redis.asyncio as aioredis
from app.config import REDIS_URL

logger = logging.getLogger("redis_cache")

# In-memory fallback if Redis server is not currently running
_memory_cache: dict[str, tuple[float, Any]] = {}
_redis_client: aioredis.Redis | None = None
_redis_available: bool | None = None
_last_redis_check: float = 0.0

def get_redis_client() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_timeout=0.3,
            socket_connect_timeout=0.3,
        )
    return _redis_client

async def get_user_cached_emails(user_id: str) -> list[dict] | None:
    """Retrieve cached emails for a user, checking Redis first, then in-memory fallback."""
    global _redis_available, _last_redis_check
    key = f"user:{user_id}:latest_emails"

    # Only retry Redis every 60 seconds if it failed previously
    now = time.time()
    if _redis_available is not False or (now - _last_redis_check > 60.0):
        try:
            _last_redis_check = now
            client = get_redis_client()
            raw = await client.get(key)
            _redis_available = True
            if raw:
                return json.loads(raw)
            return None
        except Exception:
            _redis_available = False

    # In-memory fallback
    item = _memory_cache.get(key)
    if item:
        exp, data = item
        if time.time() < exp:
            return data
        else:
            del _memory_cache[key]
    return None

async def set_user_cached_emails(user_id: str, emails_data: list[dict], ttl: int = 300) -> None:
    """Store cached emails for a user with TTL (default 5 minutes)."""
    global _redis_available
    key = f"user:{user_id}:latest_emails"
    json_str = json.dumps(emails_data, default=str)

    # Always set in memory fallback immediately
    _memory_cache[key] = (time.time() + ttl, emails_data)

    if _redis_available is False:
        return

    try:
        client = get_redis_client()
        await client.setex(key, ttl, json_str)
        _redis_available = True
    except Exception:
        _redis_available = False

async def invalidate_user_cached_emails(user_id: str) -> None:
    """Invalidate cache on sync or updates."""
    global _redis_available
    key = f"user:{user_id}:latest_emails"
    _memory_cache.pop(key, None)
    if _redis_available is False:
        return
    try:
        client = get_redis_client()
        await client.delete(key)
    except Exception:
        pass
