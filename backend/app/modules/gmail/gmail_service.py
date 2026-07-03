import os
import base64
import re
from datetime import datetime
from sqlalchemy.orm import Session

from app.modules.user.user_model import User
from app.modules.email.email_model import Email
from bs4 import BeautifulSoup
from app.modules.gmail.gmail_client import (
    GmailClient,
)
from app.modules.gmail.gmail_mapper import (
    GmailMapper,
)
from sqlalchemy.orm import Session

from app.modules.user.user_model import User

from app.modules.email.email_service import (
    email_service,
)

from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.core.config import settings


SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]


class GmailService:

    @staticmethod
    def get_auth_flow(
        redirect_uri: str,
    ) -> Flow:
        """
        Builds the Google OAuth flow using environment variables.
        """

        client_config = {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "project_id": settings.GOOGLE_PROJECT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": os.getenv(
                    "GOOGLE_AUTH_URI",
                    "https://accounts.google.com/o/oauth2/auth",
                ),
                "token_uri": os.getenv(
                    "GOOGLE_TOKEN_URI",
                    "https://oauth2.googleapis.com/token",
                ),
                "auth_provider_x509_cert_url": os.getenv(
                    "GOOGLE_AUTH_PROVIDER_CERT_URL",
                    "https://www.googleapis.com/oauth2/v1/certs",
                ),
            }
        }

        return Flow.from_client_config(
            client_config=client_config,
            scopes=SCOPES,
            redirect_uri=redirect_uri,
        )

    @staticmethod
    def get_user_profile(creds):
        """
        Returns the Gmail profile for the authenticated user.
        """

        service = build(
            "gmail",
            "v1",
            credentials=creds,
        )

        profile = (
            service.users()
            .getProfile(userId="me")
            .execute()
        )

        return {
            "email": profile.get("emailAddress"),
            "messagesTotal": profile.get("messagesTotal"),
            "threadsTotal": profile.get("threadsTotal"),
            "historyId": profile.get("historyId"),
        }

    @staticmethod
    def fetch_recent_emails(
        db: Session,
        user: User,
        creds,
        max_results: int = 10,
    ):
        """
        Fetch recent Gmail emails.

        - If already analyzed, return cached AI result.
        - Otherwise analyze once, store in DB, and reuse later.
        """

        service = GmailClient(
            creds,
        )

        messages = service.list_messages(
            max_results=max_results,
        )

        emails = []

        for message in messages:

            gmail_email = GmailMapper.map_message(
                service,
                message["id"],
            )

            cached = (

                db.query(
                    Email,
                )

                .filter(
                    Email.user_id == user.id,
                    Email.gmail_message_id == gmail_email["id"],
                )

                .first()

            )

            # --------------------------------------------------
            # Cached Email
            # --------------------------------------------------

            if cached:

                gmail_email.update(

                    {

                        # ---------------- AI ----------------

                        "score": cached.score,

                        "aiSummary": cached.ai_summary,

                        "sentiment": cached.sentiment,

                        "intent": cached.intent,

                        "engagement": cached.engagement,

                        "recommendedNudge": cached.recommended_nudge,

                        # EXACT SAME STRUCTURE
                        "suggestedResponses": cached.suggested_responses,

                        # ---------------- Optional ----------------

                        "senderAvatar": None,

                        "threadHistory": [],

                    }

                )

            # --------------------------------------------------
            # First Time Analysis
            # --------------------------------------------------

            else:

                analysis = email_service.analyze_email(
                    gmail_email["body"],
                )

                responses = analysis.get(
                    "suggestedResponses",
                    {},
                )

                replies = responses.get(
                    "replies",
                    [],
                )

                # Build ONCE
                suggested_responses = [

                    {

                        "replies": [

                            {

                                "id": str(
                                    reply.get(
                                        "id",
                                        index + 1,
                                    )
                                ),

                                "subject": gmail_email["subject"],

                                "body": reply.get(
                                    "text",
                                    "",
                                ),

                                "date": reply.get(
                                    "date",
                                    "",
                                ),

                            }

                            for index, reply in enumerate(
                                replies,
                            )

                        ]

                    }

                ]

                db.add(

                    Email(

                        user_id=user.id,

                        gmail_message_id=gmail_email["id"],

                        sender=gmail_email["sender"],

                        sender_email=gmail_email["senderEmail"],

                        subject=gmail_email["subject"],

                        email_body=gmail_email["body"],

                        ai_summary=analysis.get(
                            "aiSummary",
                            "",
                        ),

                        score=analysis.get(
                            "score",
                            "",
                        ),

                        sentiment=analysis.get(
                            "sentiment",
                            0,
                        ),

                        intent=analysis.get(
                            "intent",
                            0,
                        ),

                        engagement=analysis.get(
                            "engagement",
                            0,
                        ),

                        recommended_nudge=analysis.get(
                            "recommendedNudge",
                            "",
                        ),

                        # Save EXACT frontend structure
                        suggested_responses=suggested_responses,

                        is_read=gmail_email.get(
                            "isRead",
                            False,
                        ),

                        is_clicked=gmail_email.get(
                            "isClicked",
                            False,
                        ),

                        click_count=gmail_email.get(
                            "clickCount",
                            0,
                        ),

                    )

                )

                gmail_email.update(

                    {

                        # ---------------- AI ----------------

                        "score": analysis.get(
                            "score",
                        ),

                        "aiSummary": analysis.get(
                            "aiSummary",
                            "",
                        ),

                        "sentiment": analysis.get(
                            "sentiment",
                            0,
                        ),

                        "intent": analysis.get(
                            "intent",
                            0,
                        ),

                        "engagement": analysis.get(
                            "engagement",
                            0,
                        ),

                        "recommendedNudge": analysis.get(
                            "recommendedNudge",
                            "",
                        ),

                        # Return EXACT SAME STRUCTURE
                        "suggestedResponses": suggested_responses,

                        # ---------------- Optional ----------------

                        "senderAvatar": None,

                        "threadHistory": [],

                    }

                )

            emails.append(
                gmail_email,
            )

        db.commit()

        return emails