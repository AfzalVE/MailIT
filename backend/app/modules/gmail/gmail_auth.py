from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow


SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
]

BASE_DIR = Path(__file__).resolve().parents[3]

CLIENT_SECRET_FILE = BASE_DIR / "credentials" / "client_secret.json"


TOKEN_FILE = BASE_DIR / "credentials" / "token.json"


def authenticate_gmail():
    creds = None

    # Load saved token
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(
            str(TOKEN_FILE),
            SCOPES,
        )

    # Refresh expired token
    if creds and creds.expired and creds.refresh_token:
        print("Refreshing access token...")

        creds.refresh(Request())

        TOKEN_FILE.write_text(creds.to_json())

        return creds

    # Existing valid token
    if creds and creds.valid:
        print("Already authenticated.")

        return creds

    print("Opening browser for Google Login...")

    flow = InstalledAppFlow.from_client_secrets_file(
        str(CLIENT_SECRET_FILE),
        SCOPES,
    )

    creds = flow.run_local_server(
        host="localhost",
        port=8080,
        authorization_prompt_message="Opening browser for Google Authentication...",
        success_message="Authentication successful. You may close this window.",
    )

    TOKEN_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    TOKEN_FILE.write_text(
        creds.to_json(),
    )

    print("Authentication successful.")
    print("Token saved to:", TOKEN_FILE)

    return creds


if __name__ == "__main__":

    authenticate_gmail()