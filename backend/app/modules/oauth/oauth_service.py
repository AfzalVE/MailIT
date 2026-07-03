import json

from cryptography.fernet import Fernet

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest

from sqlalchemy.orm import Session
import requests
from app.core.config import settings
from fastapi import HTTPException
from datetime import datetime

from app.modules.oauth.oauth_model import OAuthState

from app.modules.user.user_model import User
from app.modules.oauth.oauth_model import OAuthAccount


SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]


cipher = Fernet(
    settings.GOOGLE_TOKEN_KEY.encode()
)


class OAuthService:

    def encrypt_credentials(
        self,
        credentials_json: str,
    ) -> str:

        return cipher.encrypt(
            credentials_json.encode()
        ).decode()


    def decrypt_credentials(
        self,
        encrypted: str,
    ) -> str:

        return cipher.decrypt(
            encrypted.encode()
        ).decode()

    def save_oauth_state(
        self,
        db: Session,
        state: str,
        user_id: int,
        code_verifier: str,
        expires_at: datetime,
    ):

        db.query(OAuthState).filter(
            OAuthState.user_id == user_id,
        ).delete()

        oauth_state = OAuthState(
            state=state,
            user_id=user_id,
            code_verifier=code_verifier,
            expires_at=expires_at,
        )

        db.add(oauth_state)

        db.commit()

        return oauth_state
    
    def get_oauth_state(
        self,
        db: Session,
        state: str,
    ):

        oauth_state = (
            db.query(OAuthState)
            .filter(
                OAuthState.state == state,
            )
            .first()
        )

        if oauth_state is None:
            return None

        if oauth_state.expires_at < datetime.utcnow():

            db.delete(oauth_state)

            db.commit()

            return None

        return oauth_state
    
    def delete_oauth_state(
        self,
        db: Session,
        state: str,
    ):

        oauth_state = (
            db.query(OAuthState)
            .filter(
                OAuthState.state == state,
            )
            .first()
        )

        if oauth_state:

            db.delete(oauth_state)

            db.commit()

        
    def save_google_credentials(
        self,
        db: Session,
        user: User,
        provider_email: str,
        credentials: Credentials,
    ):

        encrypted = self.encrypt_credentials(
            credentials.to_json()
        )

        account = (
            db.query(OAuthAccount)
            .filter(
                OAuthAccount.user_id == user.id,
                OAuthAccount.provider == "google",
            )
            .first()
        )

        if account:

            account.provider_email = provider_email

            account.connected = True

            account.encrypted_credentials = encrypted

        else:

            account = OAuthAccount(

                user_id=user.id,

                provider="google",

                provider_email=provider_email,

                encrypted_credentials=encrypted,

                connected=True,

            )

            db.add(account)

        db.commit()

        db.refresh(account)

        return account


    def get_google_account(
        self,
        db: Session,
        user: User,
    ):

        return (
            db.query(OAuthAccount)
            .filter(
                OAuthAccount.user_id == user.id,
                OAuthAccount.provider == "google",
                OAuthAccount.connected == True,
            )
            .first()
        )


    def get_google_credentials(
        self,
        db: Session,
        user: User,
    ):

        account = self.get_google_account(
            db,
            user,
        )

        if not account:
            return None

        credentials_json = self.decrypt_credentials(
            account.encrypted_credentials
        )

        creds = Credentials.from_authorized_user_info(
            json.loads(credentials_json),
            SCOPES,
        )

        if creds.expired and creds.refresh_token:

            creds.refresh(
                GoogleRequest()
            )

            account.encrypted_credentials = (
                self.encrypt_credentials(
                    creds.to_json()
                )
            )

            db.commit()

        return creds


    def disconnect_google(
        self,
        db: Session,
        user: User,
    ):
        """
        Disconnect the user's Google account by revoking the
        Google OAuth token and removing the stored credentials.
        """

        account = self.get_google_account(
            db,
            user,
        )

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Google account is not connected.",
            )

        # Load credentials (also refreshes them if required)
        creds = self.get_google_credentials(
            db,
            user,
        )

        # Best-effort revoke with Google
        if creds and creds.token:
            try:
                requests.post(
                    "https://oauth2.googleapis.com/revoke",
                    params={
                        "token": creds.token,
                    },
                    headers={
                        "content-type": "application/x-www-form-urlencoded",
                    },
                    timeout=10,
                )
            except Exception:
                # Even if Google revoke fails, we still remove
                # the credentials from our database.
                pass

        try:

            db.delete(account)

            db.commit()

        except SQLAlchemyError:

            db.rollback()

            raise HTTPException(
                status_code=500,
                detail="Failed to disconnect Google account.",
            )

        return {
            "success": True,
            "message": "Google account disconnected successfully.",
        }

oauth_service = OAuthService()