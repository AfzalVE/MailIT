import re

from datetime import datetime

from app.modules.gmail.gmail_attachment import (
    GmailAttachment,
)

from app.modules.gmail.gmail_cleaner import (
    GmailCleaner,
)

from app.modules.gmail.gmail_decoder import (
    GmailDecoder,
)


class GmailMapper:

    @staticmethod
    def map_message(
        client,
        message_id: str,
    ) -> dict:

        msg = client.get_message(
            message_id,
        )

        payload = msg.get(
            "payload",
            {},
        )

        headers = GmailMapper.parse_headers(
            payload,
        )

        subject = headers.get(
            "subject",
            "(No Subject)",
        )

        from_header = headers.get(
            "from",
            "Unknown Sender",
        )

        sender, sender_email = (
            GmailMapper.parse_sender(
                from_header,
            )
        )

        html_body, plain_body = (
            GmailDecoder.extract_parts(
                payload,
            )
        )

        if html_body:

            body = GmailCleaner.html_to_text(
                html_body,
            )

        else:

            body = GmailCleaner.clean_email_text(
                plain_body,
            )

        if not body:

            body = msg.get(
                "snippet",
                "",
            )

        attachments = GmailAttachment.extract(
            payload,
        )

        dt = GmailMapper.parse_datetime(
            msg,
        )

        labels = msg.get(
            "labelIds",
            [],
        )

        return {

            "id": msg["id"],

            "sender": sender or sender_email,

            "senderEmail": sender_email,

            "subject": subject,

            "body": body,

            "bodyHtml": html_body,

            "snippet": msg.get(
                "snippet",
                "",
            ),

            "time": dt.strftime(
                "%I:%M %p",
            ),

            "date": dt.strftime(
                "%b %d, %Y",
            ),

            "isRead": "UNREAD" not in labels,

            "isClicked": False,

            "clickCount": 0,

            "score": "Low",

            "aiSummary": msg.get(
                "snippet",
                "",
            ),

            "engagement": 0,

            "intent": "",

            "sentiment": "Neutral",

            "recommendedNudge": "",

            "suggestedResponses": [],

            "threadHistory": [],

            "attachments": attachments,

            "labels": labels,

            "starred": "STARRED" in labels,

            "important": "IMPORTANT" in labels,
        }

    @staticmethod
    def parse_headers(
        payload: dict,
    ) -> dict:

        return {

            header["name"].lower(): header["value"]

            for header in payload.get(
                "headers",
                [],
            )

        }

    @staticmethod
    def parse_sender(
        from_header: str,
    ) -> tuple[str, str]:

        sender = from_header

        sender_email = ""

        match = re.match(
            r'(.*)<(.+?)>',
            from_header,
        )

        if match:

            sender = (
                match.group(1)
                .strip()
                .replace('"', "")
            )

            sender_email = (
                match.group(2)
                .strip()
            )

        return (
            sender,
            sender_email,
        )

    @staticmethod
    def parse_datetime(
        message: dict,
    ) -> datetime:

        timestamp = (

            int(
                message.get(
                    "internalDate",
                    "0",
                )
            )

            / 1000

        )

        return datetime.fromtimestamp(
            timestamp,
        )