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


class AIService:

    def analyze_email(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            EMAIL_ANALYZER_PROMPT,
            email,
        )


    def summarize_email(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            EMAIL_SUMMARY_PROMPT,
            email,
        )


    def generate_smart_replies(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            SMART_REPLY_PROMPT,
            email,
        )


    def draft_email(
        self,
        prompt: str,
    ):

        return groq_client.generate_json(
            EMAIL_DRAFT_PROMPT,
            prompt,
        )


    def rewrite_email(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            EMAIL_REWRITE_PROMPT,
            email,
        )


    def extract_meeting(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            MEETING_PROMPT,
            email,
        )


    def extract_crm(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            CRM_PROMPT,
            email,
        )


    def detect_followup(
        self,
        email: str,
    ):

        return groq_client.generate_json(
            FOLLOWUP_PROMPT,
            email,
        )


    def full_email_intelligence(
        self,
        email: str,
    ):

        analysis = self.analyze_email(
            email,
        )

        summary = self.summarize_email(
            email,
        )

        replies = self.generate_smart_replies(
            email,
        )

        meeting = self.extract_meeting(
            email,
        )

        crm = self.extract_crm(
            email,
        )

        followup = self.detect_followup(
            email,
        )

        return {
            "analysis": analysis,
            "summary": summary,
            "smart_replies": replies,
            "meeting": meeting,
            "crm": crm,
            "followup": followup,
        }


ai_service = AIService()