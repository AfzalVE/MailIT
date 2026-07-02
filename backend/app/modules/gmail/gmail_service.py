import os
import json
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build
import base64
import html2text
import re
from bs4 import BeautifulSoup
from datetime import datetime



SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# Target the credentials directory relative to the workspace root
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
CREDENTIALS_PATH = os.path.join(BASE_DIR, "backend", "credentials", "gmail_secret.json")
TOKEN_PATH = os.path.join(BASE_DIR, "backend", "credentials", "gmail_token.json")

# Ensure the credentials directory exists for saving tokens later
os.makedirs(os.path.dirname(TOKEN_PATH), exist_ok=True)

class GmailService:
    @staticmethod
    def get_valid_credentials():
        """Loads a stored token, refreshes it if expired, or returns None if re-auth is needed."""
        if not os.path.exists(TOKEN_PATH):
            return None
            
        try:
            with open(TOKEN_PATH, 'r') as token_f:
                token_data = json.load(token_f)
            
            creds = Credentials.from_authorized_user_info(token_data, SCOPES)
            
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(GoogleRequest())
                with open(TOKEN_PATH, 'w') as token_f:
                    token_f.write(creds.to_json())
                    
            if creds and creds.valid:
                return creds
        except Exception as e:
            print(f"GmailService: Error loading/refreshing credentials: {e}")
            
        return None

    @staticmethod
    def get_auth_flow(redirect_uri: str) -> Flow:
        """Builds the OAuth authentication flow using your path file."""
        if not os.path.exists(CREDENTIALS_PATH):
            raise FileNotFoundError(f"Missing Gmail secrets config file at: {CREDENTIALS_PATH}")
            
        return Flow.from_client_secrets_file(
            CREDENTIALS_PATH,
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )
    @staticmethod
    def get_user_profile(creds):
        """Returns the authenticated Gmail user's profile."""
        service = build("gmail", "v1", credentials=creds)
        profile = service.users().getProfile(userId="me").execute()

        return {
            "email": profile.get("emailAddress"),
            "messagesTotal": profile.get("messagesTotal"),
            "threadsTotal": profile.get("threadsTotal"),
            "historyId": profile.get("historyId"),
        }

    @staticmethod
    def fetch_recent_emails(creds, max_results: int = 10):
        """
        Fetch recent Gmail emails and normalize them for the frontend.
        """

        service = build("gmail", "v1", credentials=creds)

        results = (
            service.users()
            .messages()
            .list(
                userId="me",
                labelIds=["INBOX"],
                maxResults=max_results,
            )
            .execute()
        )

        messages = results.get("messages", [])

        emails = []

        def decode_base64(data):
            if not data:
                return ""

            try:
                return base64.urlsafe_b64decode(data).decode(
                    "utf-8",
                    errors="ignore",
                )
            except Exception:
                return ""

        def extract_parts(part):
            """
            Recursively extract HTML and plain text.
            """

            html = None
            text = None

            mime = part.get("mimeType", "")

            if mime == "text/html":
                html = decode_base64(part.get("body", {}).get("data"))

            elif mime == "text/plain":
                text = decode_base64(part.get("body", {}).get("data"))

            for child in part.get("parts", []):
                child_html, child_text = extract_parts(child)

                if child_html and not html:
                    html = child_html

                if child_text and not text:
                    text = child_text

            return html, text

        def clean_email_text(text: str):

            if not text:
                return ""

            text = re.sub(r'[\u200B-\u200D\u2060\uFEFF\u034F]+', '', text)

            text = re.sub(r'https?://\S+', '', text)

            text = re.sub(r'\[.*?\]\(.*?\)', '', text)

            text = re.sub(r'\(\s*\)', '', text)

            text = re.sub(r'^\|.*$', '', text, flags=re.MULTILINE)

            text = re.sub(r'^-+$', '', text, flags=re.MULTILINE)

            text = re.sub(r'\[Image\]', '', text, flags=re.IGNORECASE)

            text = re.sub(r'Top Posts This Week', '', text, flags=re.IGNORECASE)

            text = re.sub(r'^\d+(\.\d+)?[kKmM]?\s+members$', '', text, flags=re.MULTILINE)

            footer_patterns = [
                r'unsubscribe.*',
                r'manage preferences.*',
                r'privacy policy.*',
                r'view in browser.*',
                r'copyright.*',
                r'all rights reserved.*',
                r'this email was intended.*',
                r'548 market st.*',
                r'san francisco.*',
                r'github',
                r'linkedin',
                r'discord',
                r'youtube',
                r'follow us',
            ]

            cleaned = []

            for line in text.splitlines():

                line = line.strip()

                if not line:
                    cleaned.append("")
                    continue

                lower = line.lower()

                if any(re.search(pattern, lower) for pattern in footer_patterns):
                    continue

                if len(line) == 1:
                    continue

                cleaned.append(line)

            text = "\n".join(cleaned)

            text = re.sub(r'\n{3,}', '\n\n', text)

            return text.strip()

        def html_to_text(html):

            soup = BeautifulSoup(html, "html.parser")

            for tag in soup([
                "script",
                "style",
                "head",
                "meta",
                "title",
                "svg",
                "img",
                "picture",
                "noscript",
            ]):
                tag.decompose()

            return clean_email_text(
                soup.get_text(
                    separator="\n",
                    strip=True,
                )
            )

        def find_attachments(part, attachments):

            filename = part.get("filename")

            if filename:

                attachments.append(
                    {
                        "name": filename,
                        "type": filename.split(".")[-1].lower(),
                        "size": f'{part.get("body", {}).get("size",0)//1024} KB',
                    }
                )

            for child in part.get("parts", []):
                find_attachments(child, attachments)

        for item in messages:

            msg = (
                service.users()
                .messages()
                .get(
                    userId="me",
                    id=item["id"],
                    format="full",
                )
                .execute()
            )

            payload = msg.get("payload", {})

            headers = {
                h["name"].lower(): h["value"]
                for h in payload.get("headers", [])
            }

            subject = headers.get("subject", "(No Subject)")

            from_header = headers.get("from", "Unknown Sender")

            sender = from_header
            sender_email = ""

            match = re.match(r'(.*)<(.+?)>', from_header)

            if match:
                sender = match.group(1).strip().replace('"', "")
                sender_email = match.group(2).strip()

            html_body, plain_body = extract_parts(payload)

            if html_body:
                body = html_to_text(html_body)
            else:
                body = clean_email_text(plain_body)

            if not body:
                body = msg.get("snippet", "")

            attachments = []
            find_attachments(payload, attachments)

            timestamp = int(msg.get("internalDate", "0")) / 1000
            dt = datetime.fromtimestamp(timestamp)

            emails.append(
                {
                    "id": msg["id"],

                    "sender": sender or sender_email,
                    "senderEmail": sender_email,

                    "subject": subject,

                    "body": body,

                    "bodyHtml": html_body,

                    "snippet": msg.get("snippet", ""),

                    "time": dt.strftime("%I:%M %p"),

                    "date": dt.strftime("%b %d, %Y"),

                    "isRead": "UNREAD" not in msg.get("labelIds", []),

                    "isClicked": False,
                    "clickCount": 0,

                    "score": "Low",

                    "aiSummary": msg.get("snippet", ""),

                    "engagement": 0,

                    "intent": 0,

                    "sentiment": "Neutral",

                    "recommendedNudge": "",

                    "suggestedResponses": [],

                    "threadHistory": [],

                    "attachments": attachments,

                    "labels": msg.get("labelIds", []),

                    "starred": "STARRED" in msg.get("labelIds", []),

                    "important": "IMPORTANT" in msg.get("labelIds", []),
                }
            )

        return emails
        