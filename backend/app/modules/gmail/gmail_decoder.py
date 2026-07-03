import base64


class GmailDecoder:

    @staticmethod
    def decode_base64(
        data: str | None,
    ) -> str:

        if not data:
            return ""

        try:
            return base64.urlsafe_b64decode(
                data,
            ).decode(
                "utf-8",
                errors="ignore",
            )

        except Exception:
            return ""

    @staticmethod
    def extract_parts(
        part: dict,
    ) -> tuple[str | None, str | None]:

        html = None
        text = None

        mime_type = part.get(
            "mimeType",
            "",
        )

        body = part.get(
            "body",
            {},
        )

        if mime_type == "text/html":

            html = GmailDecoder.decode_base64(
                body.get("data"),
            )

        elif mime_type == "text/plain":

            text = GmailDecoder.decode_base64(
                body.get("data"),
            )

        for child in part.get(
            "parts",
            [],
        ):

            child_html, child_text = (
                GmailDecoder.extract_parts(
                    child,
                )
            )

            if child_html and not html:
                html = child_html

            if child_text and not text:
                text = child_text

        return (
            html,
            text,
        )