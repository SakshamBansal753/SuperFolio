import base64
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException, status

GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"


async def list_message_ids(access_token: str, query: str, max_results: int = 20) -> list[str]:
    """Returns just the message IDs matching a Gmail search query — a cheap
    call, doesn't fetch any actual email content yet.

    `query` uses Gmail's own search syntax, e.g.
    'subject:(interview OR application OR offer) newer_than:30d'
    """
    url = f"{GMAIL_API_BASE}/messages"
    params = {"q": query, "maxResults": max_results}
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers)

    if response.status_code != 200:
        err_msg = "Gmail API request failed while listing messages"
        try:
            err_data = response.json()
            if "error" in err_data and "message" in err_data["error"]:
                err_msg = f"Gmail API error: {err_data['error']['message']}"
                if response.status_code == 403:
                    err_msg += " (The Google account in Clerk is missing the 'https://www.googleapis.com/auth/gmail.readonly' scope. Please add this scope in Clerk Dashboard -> Social Connections -> Google, then re-sign in)."
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail=err_msg,
        )

    data = response.json()
    return [msg["id"] for msg in data.get("messages", [])]


def _decode_body(data: str) -> str:
    """Gmail encodes body content as base64url, which uses '-'/'_' instead
    of the standard '+'/'/' — Python's base64 needs the urlsafe variant."""
    padded = data + "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(padded).decode("utf-8", errors="replace")


def _extract_plain_text(payload: dict) -> str:
    """Gmail messages are structured like a filesystem — a message can have
    multiple 'parts' (plain text version, HTML version, attachments...),
    and parts can nest inside parts. We only want the plain text body, so
    we walk the tree looking for it."""
    if payload.get("mimeType") == "text/plain" and "data" in payload.get("body", {}):
        return _decode_body(payload["body"]["data"])

    for part in payload.get("parts", []):
        text = _extract_plain_text(part)
        if text:
            return text

    return ""


async def get_message(access_token: str, message_id: str) -> dict:
    """Fetches one message and parses it down to just what we store:
    sender, subject, plain-text body, and when it was received."""
    url = f"{GMAIL_API_BASE}/messages/{message_id}"
    headers = {"Authorization": f"Bearer {access_token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={"format": "full"}, headers=headers)

    if response.status_code != 200:
        err_msg = f"Gmail API request failed while fetching message {message_id}"
        try:
            err_data = response.json()
            if "error" in err_data and "message" in err_data["error"]:
                err_msg = f"Gmail API error: {err_data['error']['message']}"
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail=err_msg,
        )

    data = response.json()
    headers_list = data["payload"].get("headers", [])

    def header(name: str) -> str:
        return next((h["value"] for h in headers_list if h["name"].lower() == name.lower()), "")

    received_at = datetime.fromtimestamp(int(data["internalDate"]) / 1000, tz=timezone.utc)

    return {
        "gmail_message_id": data["id"],
        "sender": header("From"),
        "subject": header("Subject"),
        "body": _extract_plain_text(data["payload"]),
        "received_at": received_at,
    }