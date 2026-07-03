import os

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from googleapiclient.discovery import build

from app.core.config import settings
from app.core.database import get_db

from app.modules.user.user_model import User

from app.modules.auth.dependencies import (
    get_current_user,
)

from app.modules.gmail.gmail_service import GmailService

from app.modules.oauth.oauth_service import (
    oauth_service,
)

from app.modules.oauth.oauth_security import (
    create_state,
    verify_state,
)

router = APIRouter(
    prefix="/oauth",
    tags=["OAuth"],
)

REDIRECT_URI = (
    f"{settings.BACKEND_URL.rstrip('/')}"
    "/oauth/google/callback"
)
@router.post("/google/connect")
def connect_google(
    current_user: User = Depends(
        get_current_user,
    ),
    db: Session = Depends(
        get_db,
    ),
):

    state = create_state(
        current_user.id,
    )

    flow = GmailService.get_auth_flow(
        REDIRECT_URI,
    )
    from datetime import datetime, timedelta

    authorization_url, _ = flow.authorization_url(
    access_type="offline",
    include_granted_scopes="true",
    prompt="consent",
    state=state,
)

    oauth_service.save_oauth_state(
        db=db,
        state=state,
        user_id=current_user.id,
        code_verifier=flow.code_verifier,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )


    return {
    "authorization_url": authorization_url,
}

@router.get("/google/callback")
def google_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db),
):

    user_id = verify_state(
        state,
    )

    oauth_state = oauth_service.get_oauth_state(
                    db,
                    state,
                )
    
    if oauth_state is None:

        raise HTTPException(
            status_code=400,
            detail="OAuth state expired.",
        )
    user = (
        db.query(User)
        .filter(
            User.id == user_id,
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    flow = GmailService.get_auth_flow(
        REDIRECT_URI,
    )
    flow.code_verifier = oauth_state.code_verifier
    flow.fetch_token(
        code=code,
    )

    credentials = flow.credentials

    gmail = build(
        "gmail",
        "v1",
        credentials=credentials,
    )

    profile = (
        gmail.users()
        .getProfile(
            userId="me",
        )
        .execute()
    )

    oauth_service.save_google_credentials(
        db=db,
        user=user,
        provider_email=profile["emailAddress"],
        credentials=credentials,
    )
    oauth_service.delete_oauth_state(
                db,
                state,
            )
    return RedirectResponse(
        f"{settings.FRONTEND_URL}"
    )

@router.get("/google/status")
def google_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    account = oauth_service.get_google_account(
        db,
        current_user,
    )

    if not account:

        return {
            "connected": False,
        }

    return {
        "connected": True,
        "provider": account.provider,
        "email": account.provider_email,
    }

@router.delete("/google")
def disconnect_google(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user,
    ),
):

    oauth_service.disconnect_google(
        db,
        current_user,
    )

    return {
        "success": True,
        "message": "Google account disconnected.",
    }