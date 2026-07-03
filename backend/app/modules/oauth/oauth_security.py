import base64
import hashlib
import hmac
import json
import time

from fastapi import HTTPException

from app.core.config import settings


STATE_EXPIRATION_SECONDS = 600  # 10 minutes


def create_state(user_id: int) -> str:
    """
    Creates a signed OAuth state containing the current user ID.
    """

    payload = {
        "user_id": user_id,
        "exp": int(time.time()) + STATE_EXPIRATION_SECONDS,
    }

    payload_json = json.dumps(
        payload,
        separators=(",", ":"),
    ).encode()

    payload_b64 = base64.urlsafe_b64encode(
        payload_json
    ).decode()

    signature = hmac.new(
        settings.OAUTH_STATE_SECRET.encode(),
        payload_b64.encode(),
        hashlib.sha256,
    ).hexdigest()

    return f"{payload_b64}.{signature}"


def verify_state(state: str) -> int:
    """
    Verifies the OAuth state and returns the user_id.
    """

    try:

        payload_b64, signature = state.split(".", 1)

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="Invalid OAuth state.",
        )

    expected_signature = hmac.new(
        settings.OAUTH_STATE_SECRET.encode(),
        payload_b64.encode(),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        signature,
        expected_signature,
    ):
        raise HTTPException(
            status_code=400,
            detail="OAuth state signature mismatch.",
        )

    payload = json.loads(
        base64.urlsafe_b64decode(
            payload_b64.encode()
        )
    )

    if payload["exp"] < int(time.time()):
        raise HTTPException(
            status_code=400,
            detail="OAuth state expired.",
        )

    return payload["user_id"]