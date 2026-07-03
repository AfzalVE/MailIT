from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


class GmailClient:

    def __init__(
        self,
        credentials: Credentials,
    ):

        self.service = build(
            "gmail",
            "v1",
            credentials=credentials,
        )

    def list_messages(
        self,
        max_results: int = 10,
        label_ids: list[str] | None = None,
    ) -> list[dict]:

        response = (
            self.service.users()
            .messages()
            .list(
                userId="me",
                labelIds=label_ids or ["INBOX"],
                maxResults=max_results,
            )
            .execute()
        )

        return response.get(
            "messages",
            [],
        )

    def get_message(
        self,
        message_id: str,
        format: str = "full",
    ) -> dict:

        return (
            self.service.users()
            .messages()
            .get(
                userId="me",
                id=message_id,
                format=format,
            )
            .execute()
        )

    def get_profile(
        self,
    ) -> dict:

        return (
            self.service.users()
            .getProfile(
                userId="me",
            )
            .execute()
        )