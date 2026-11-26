import httpx
from fastapi import HTTPException, status

from app.config import CLERK_SECRET_KEY

CLERK_API_BASE = "https://api.clerk.com/v1"


async def get_google_access_token(clerk_user_id: str) -> str:
    """Asks Clerk for this user's current Google OAuth access token.

    Clerk holds the actual Google refresh token on our behalf and exchanges
    it for a fresh access token on every call — we never see or store a
    Google credential ourselves, just borrow a short-lived token each time
    we need to call the Gmail API.
    """
    url = f"{CLERK_API_BASE}/users/{clerk_user_id}/oauth_access_tokens/google"
    headers = {"Authorization": f"Bearer {CLERK_SECRET_KEY}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail="Could not retrieve Google access token — user may need to reconnect Google",
        )

    data = response.json()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail="No Google account connected for this user",
        )

    return data[0]["token"]