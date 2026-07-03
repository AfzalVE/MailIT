class GmailAttachment:

    @staticmethod
    def extract(
        part: dict,
    ) -> list[dict]:

        attachments: list[dict] = []

        GmailAttachment._walk_parts(
            part,
            attachments,
        )

        return attachments

    @staticmethod
    def _walk_parts(
        part: dict,
        attachments: list[dict],
    ) -> None:

        filename = part.get(
            "filename",
        )

        if filename:

            attachments.append(
                {
                    "name": filename,
                    "type": filename.split(".")[-1].lower(),
                    "size": (
                        f"{part.get('body', {}).get('size', 0) // 1024} KB"
                    ),
                }
            )

        for child in part.get(
            "parts",
            [],
        ):

            GmailAttachment._walk_parts(
                child,
                attachments,
            )