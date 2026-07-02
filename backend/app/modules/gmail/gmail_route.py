import os
import json
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from app.modules.gmail.gmail_service import GmailService, TOKEN_PATH

# Allow insecure HTTP only for testing local endpoints (Remove in production)
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

router = APIRouter(prefix="/gmail", tags=["Gmail Integration"])

# Use your primary fallback testing route string
REDIRECT_URI = "http://127.0.0.1:8000/gmail/auth/callback"

@router.get("/login")
def login(request: Request):
    """Step 1: Get redirect URL link and store PKCE/state parameters inside the session cookie."""
    creds = GmailService.get_valid_credentials()
    if creds:
        return RedirectResponse(url="/gmail/recent")

    flow = GmailService.get_auth_flow(redirect_uri=REDIRECT_URI)
    
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )

    # Save the dynamic OAuth properties safely into the encrypted session middleware
    request.session['oauth_state'] = state
    request.session['code_verifier'] = flow.code_verifier

    return RedirectResponse(url=authorization_url)

@router.get("/auth/callback")
def callback(request: Request):
    """Step 2: Explicitly trade authorization code for user access token safely using session context."""
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code from Google.")

    # Retrieve parameters saved in the middleware session
    saved_state = request.session.get('oauth_state')
    code_verifier = request.session.get('code_verifier')

    # Security check to guarantee cross-site request forgery protection
    if not saved_state or state != saved_state:
        raise HTTPException(status_code=400, detail="OAuth state mismatch or session expired.")

    try:
        # Reconstruct the flow context cleanly without passing 'state' as a keyword argument
        flow = GmailService.get_auth_flow(redirect_uri=REDIRECT_URI)
        
        # Assign the state context and verifier directly to the flow instance properties
        flow.oauth2session.state = saved_state
        flow.code_verifier = code_verifier
        
        # Complete the handshake
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Write tokens cleanly using internal structures
        with open(TOKEN_PATH, 'w') as token_f:
            token_f.write(credentials.to_json())

        # Clean up the session cookies since the handshake was a success
        request.session.pop('oauth_state', None)
        request.session.pop('code_verifier', None)

    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Google Token Exchange Failed: {str(e)}"
        )

    return RedirectResponse(url="/gmail/recent")


@router.get("/auth-status")
def auth_status():
    """
    Check whether Gmail is connected.
    """
    print("HERE")
    creds = GmailService.get_valid_credentials()

    if not creds:
        return {
            "connected": False,
            "email": None,
        }

    try:
        profile = GmailService.get_user_profile(creds)

        return {
            "connected": True,
            "email": profile["email"],
            "messagesTotal": profile["messagesTotal"],
            "threadsTotal": profile["threadsTotal"],
        }

    except Exception:
        return {
            "connected": False,
            "email": None,
        }


@router.get("/recent")
def recent_emails():
    """Step 3: Read and map structure containing sender profiles and summaries."""
    creds = GmailService.get_valid_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Authentication required. Go to /gmail/login")

    try:
        emails = GmailService.fetch_recent_emails(creds, max_results=10)
        return {"status": "success", "count": len(emails), "emails": emails}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to pull records: {str(e)}")