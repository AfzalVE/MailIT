from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.modules.auth.dependencies import (
    get_current_user,
)

from app.modules.oauth.oauth_service import (
    oauth_service,
)

from app.modules.gmail.gmail_service import (
    GmailService,
)

router = APIRouter(
    prefix="/gmail",
    tags=["Gmail"],
)
@router.get("/recent")
def recent_emails(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Fetch the authenticated user's recent Gmail emails.
    """

    creds = oauth_service.get_google_credentials(
        db,
        current_user,
    )

    if not creds:

        raise HTTPException(
            status_code=401,
            detail="Google account not connected.",
        )

    emails = GmailService.fetch_recent_emails(
        db=db,
        user=current_user,
        creds=creds,
        max_results=2,
    )

    return {
        "status": "success",
        "count": len(emails),
        "emails": emails,
    }
@router.get("/profile")
def gmail_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    creds = oauth_service.get_google_credentials(
        db,
        current_user,
    )

    if not creds:

        raise HTTPException(
            status_code=401,
            detail="Google account not connected.",
        )

    return GmailService.get_user_profile(
        creds,
    )