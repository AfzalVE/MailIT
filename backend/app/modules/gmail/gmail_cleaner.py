import re

from bs4 import BeautifulSoup


class GmailCleaner:

    FOOTER_PATTERNS = [
        r"unsubscribe.*",
        r"manage preferences.*",
        r"privacy policy.*",
        r"view in browser.*",
        r"copyright.*",
        r"all rights reserved.*",
        r"this email was intended.*",
        r"548 market st.*",
        r"san francisco.*",
        r"github",
        r"linkedin",
        r"discord",
        r"youtube",
        r"follow us",
    ]

    @staticmethod
    def clean_email_text(
        text: str,
    ) -> str:

        if not text:
            return ""

        text = re.sub(
            r"[\u200B-\u200D\u2060\uFEFF\u034F]+",
            "",
            text,
        )

        text = re.sub(
            r"https?://\S+",
            "",
            text,
        )

        text = re.sub(
            r"\[.*?\]\(.*?\)",
            "",
            text,
        )

        text = re.sub(
            r"\(\s*\)",
            "",
            text,
        )

        text = re.sub(
            r"^\|.*$",
            "",
            text,
            flags=re.MULTILINE,
        )

        text = re.sub(
            r"^-+$",
            "",
            text,
            flags=re.MULTILINE,
        )

        text = re.sub(
            r"\[Image\]",
            "",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(
            r"Top Posts This Week",
            "",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(
            r"^\d+(\.\d+)?[kKmM]?\s+members$",
            "",
            text,
            flags=re.MULTILINE,
        )

        cleaned = []

        for line in text.splitlines():

            line = line.strip()

            if not line:
                cleaned.append("")
                continue

            lower = line.lower()

            if any(
                re.search(
                    pattern,
                    lower,
                )
                for pattern in GmailCleaner.FOOTER_PATTERNS
            ):
                continue

            if len(line) == 1:
                continue

            cleaned.append(line)

        text = "\n".join(cleaned)

        text = re.sub(
            r"\n{3,}",
            "\n\n",
            text,
        )

        return text.strip()

    @staticmethod
    def html_to_text(
        html: str,
    ) -> str:

        if not html:
            return ""

        soup = BeautifulSoup(
            html,
            "html.parser",
        )

        for tag in soup(
            [
                "script",
                "style",
                "head",
                "meta",
                "title",
                "svg",
                "img",
                "picture",
                "noscript",
            ]
        ):
            tag.decompose()

        text = soup.get_text(
            separator="\n",
            strip=True,
        )

        return GmailCleaner.clean_email_text(
            text,
        )