from typing import Any

from app.ai.groq_client import groq_client

from app.ai.prompts.analyzer_prompt import (
    EMAIL_ANALYZER_PROMPT,
)

from app.ai.prompts.summary_prompt import (
    EMAIL_SUMMARY_PROMPT,
)

from app.ai.prompts.smart_reply_prompt import (
    SMART_REPLY_PROMPT,
)

from app.ai.prompts.draft_prompt import (
    EMAIL_DRAFT_PROMPT,
)

from app.ai.prompts.rewrite_prompt import (
    EMAIL_REWRITE_PROMPT,
)

from app.ai.prompts.meeting_prompt import (
    MEETING_PROMPT,
)

from app.ai.prompts.crm_prompt import (
    CRM_PROMPT,
)

from app.ai.prompts.followup_prompt import (
    FOLLOWUP_PROMPT,
)


class EmailAIService:
    """
    AI Engine for ReplyIQ.

    Responsible only for AI related tasks.

    Does NOT interact with the database.
    Does NOT call Gmail APIs.
    """

    # --------------------------------------------------
    # Complete Email Analysis
    # --------------------------------------------------

    @staticmethod
    def analyze_email(
        email_body: str,
    ) -> dict[str, Any]:
        """
        Returns complete AI analysis.
        """

        return groq_client.generate_json(
            system_prompt=EMAIL_ANALYZER_PROMPT,
            user_prompt=email_body,
            temperature=0.2,
        )

    # --------------------------------------------------
    # Summarization
    # --------------------------------------------------

    @staticmethod
    def summarize(
        email_body: str,
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=EMAIL_SUMMARY_PROMPT,
            user_prompt=email_body,
            temperature=0.2,
        )

    # --------------------------------------------------
    # Smart Reply Suggestions
    # --------------------------------------------------

    @staticmethod
    def smart_reply(
        email_body: str,
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=SMART_REPLY_PROMPT,
            user_prompt=email_body,
            temperature=0.4,
        )

    # --------------------------------------------------
    # Draft Email
    # --------------------------------------------------

    @staticmethod
    def draft_email(
        prompt: str,
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=EMAIL_DRAFT_PROMPT,
            user_prompt=prompt,
            temperature=0.6,
        )

    # --------------------------------------------------
    # Rewrite Email
    # --------------------------------------------------

    @staticmethod
    def rewrite_email(
        email: str,
        tone: str = "Professional",
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=EMAIL_REWRITE_PROMPT,
            user_prompt=f"""
Tone:
{tone}

Email:

{email}
""",
            temperature=0.4,
        )

    # --------------------------------------------------
    # Lead Score
    # --------------------------------------------------

    @staticmethod
    def lead_score(
        email_body: str,
    ) -> dict[str, Any]:

        analysis = groq_client.generate_json(
            system_prompt=EMAIL_ANALYZER_PROMPT,
            user_prompt=email_body,
            temperature=0.2,
        )

        return {
            "lead_score": analysis.get(
                "lead_score",
                0,
            ),
            "lead_status": analysis.get(
                "lead_status",
                "Cold",
            ),
            "lead_stage": analysis.get(
                "lead_stage",
                "",
            ),
        }

    # --------------------------------------------------
    # Intent
    # --------------------------------------------------

    @staticmethod
    def detect_intent(
        email_body: str,
    ) -> str:

        analysis = groq_client.generate_json(
            system_prompt=EMAIL_ANALYZER_PROMPT,
            user_prompt=email_body,
        )

        return analysis.get(
            "intent",
            "",
        )

    # --------------------------------------------------
    # Sentiment
    # --------------------------------------------------

    @staticmethod
    def detect_sentiment(
        email_body: str,
    ) -> str:

        analysis = groq_client.generate_json(
            system_prompt=EMAIL_ANALYZER_PROMPT,
            user_prompt=email_body,
        )

        return analysis.get(
            "sentiment",
            "Neutral",
        )

    # --------------------------------------------------
    # Category
    # --------------------------------------------------

    @staticmethod
    def detect_category(
        email_body: str,
    ) -> str:

        analysis = groq_client.generate_json(
            system_prompt=EMAIL_ANALYZER_PROMPT,
            user_prompt=email_body,
        )

        return analysis.get(
            "category",
            "General",
        )

    # --------------------------------------------------
    # Meeting Detection
    # --------------------------------------------------

    @staticmethod
    def detect_meeting(
        email_body: str,
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=MEETING_PROMPT,
            user_prompt=email_body,
            temperature=0.2,
        )

    # --------------------------------------------------
    # CRM Extraction
    # --------------------------------------------------

    @staticmethod
    def extract_crm(
        email_body: str,
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=CRM_PROMPT,
            user_prompt=email_body,
            temperature=0.2,
        )

    # --------------------------------------------------
    # Follow-up Recommendation
    # --------------------------------------------------

    @staticmethod
    def recommend_followup(
        email_body: str,
    ) -> dict[str, Any]:

        return groq_client.generate_json(
            system_prompt=FOLLOWUP_PROMPT,
            user_prompt=email_body,
            temperature=0.2,
        )

    # --------------------------------------------------
    # Complete AI Pipeline
    # --------------------------------------------------

    @staticmethod
    def full_analysis(
        email_body: str,
    ) -> dict[str, Any]:

        analysis = EmailAIService.analyze_email(
            email_body,
        )

        replies = EmailAIService.smart_reply(
            email_body,
        )

        # meeting = EmailAIService.detect_meeting(
        #     email_body,
        # )

        # crm = EmailAIService.extract_crm(
        #     email_body,
        # )

        # followup = EmailAIService.recommend_followup(
        #     email_body,
        # )

        return {
            "analysis": analysis,
            "smart_replies": replies,
            # "meeting": meeting,
            # "crm": crm,
            # "followup": followup,
        }
    @staticmethod
    def analyze_inbox_email(
        email_body: str,
    ) -> dict:

        analysis = email_ai_service.analyze_email(
            email_body,
        )

        replies = email_ai_service.smart_reply(
            email_body,
        )

        return {
            "summary": analysis.get(
                "summary",
                "",
            ),

            "score": analysis.get(
                "lead_status",
                "Cold",
            ),

            "lead_score": int(
                analysis.get(
                    "lead_score",
                    0,
                )
            ),

            "sentiment": analysis.get(
                "sentiment_score",
                50,
            ),

            "intent": analysis.get(
                "intent_score",
                50,
            ),

            "engagement": analysis.get(
                "engagement_score",
                50,
            ),

            "suggestedResponses": replies,

            "recommendedNudge": analysis.get(
                "recommended_nudge",
                "",
            ),
        }

email_ai_service = EmailAIService()