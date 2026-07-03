from sqlalchemy.orm import Session

from app.modules.email.email_model import Email

from app.modules.email.email_ai_service import (
    email_ai_service,
)


class EmailService:

    # --------------------------------------------------
    # Analyze Email
    # --------------------------------------------------

    @staticmethod
    def analyze_email(
        db: Session,
        user_id: int,
        sender: str,
        subject: str,
        email_body: str,
    ) -> Email:

        ai = email_ai_service.full_analysis(
            email_body,
        )

        analysis = ai["analysis"]

        smart_replies = ai["smart_replies"]

        meeting = ai["meeting"]

        crm = ai["crm"]

        followup = ai["followup"]

        # ---------------- Safe Conversions ----------------

        try:
            lead_score = int(
                analysis.get("lead_score", 0)
            )
        except (TypeError, ValueError):
            lead_score = 0

        try:
            estimated_value = float(
                crm.get("estimated_value")
            )
        except (TypeError, ValueError):
            estimated_value = None


        # ---------------- Create Email ----------------

        email = Email(

            user_id=user_id,

            sender=sender,

            subject=subject,

            email_body=email_body,

            # ---------------- AI ----------------

            summary=analysis.get(
                "summary",
            ),

            smart_reply=analysis.get(
                "reply",
            ),

            smart_replies=smart_replies.get(
                "replies",
                [],
            ),

            sentiment=analysis.get(
                "sentiment",
            ),

            intent=analysis.get(
                "intent",
            ),

            category=analysis.get(
                "category",
            ),

            priority=analysis.get(
                "priority",
            ),

            # ---------------- Lead ----------------

            lead_score=lead_score,

            lead_status=analysis.get(
                "lead_status",
                "Cold",
            ),

            lead_stage=analysis.get(
                "lead_stage",
                "",
            ),

            # ---------------- Meeting ----------------

            meeting_requested=meeting.get(
                "meeting",
                False,
            ),

            meeting_date=meeting.get(
                "date",
            ),

            meeting_time=meeting.get(
                "time",
            ),

            meeting_timezone=meeting.get(
                "timezone",
            ),

            # ---------------- Follow-up ----------------

            follow_up_required=followup.get(
                "needs_followup",
                False,
            ),

            follow_up_date=followup.get(
                "followup_date",
            ),

            follow_up_reason=followup.get(
                "reason",
            ),

            # ---------------- CRM ----------------

            company=crm.get(
                "company",
            ),

            contact_name=crm.get(
                "contact_name",
            ),

            contact_email=crm.get(
                "email",
            ),

            contact_phone=crm.get(
                "phone",
            ),

            website=crm.get(
                "website",
            ),

            deal_stage=crm.get(
                "deal_stage",
            ),

            estimated_value=estimated_value,

            # ---------------- Misc ----------------

            keywords=analysis.get(
                "keywords",
                [],
            ),

            action_items=analysis.get(
                "action_items",
                [],
            ),
        )

        db.add(
            email,
        )

        db.commit()

        db.refresh(
            email,
        )

        return email
    

    @staticmethod
    def analyze_email(
        email_body: str,
    ) -> dict:

        ai = email_ai_service.analyze_inbox_email(
            email_body,
        )
        print("AI Analysis Result:", ai)  # Debugging line to print the AI analysis result
        return {

            "score": ai["score"],

            "aiSummary": ai["summary"],

            "sentiment": ai["sentiment"],

            "intent": ai["intent"],

            "engagement": ai["engagement"],

            "suggestedResponses": ai[
                "suggestedResponses"
            ],

            "recommendedNudge": ai[
                "recommendedNudge"
            ],
        }
    # --------------------------------------------------
    # History
    # --------------------------------------------------

    @staticmethod
    def get_history(
        db: Session,
        user_id: int,
    ):

        return (

            db.query(
                Email,
            )

            .filter(
                Email.user_id == user_id,
            )

            .order_by(
                Email.created_at.desc(),
            )

            .all()

        )

    # --------------------------------------------------
    # Leads
    # --------------------------------------------------

    @staticmethod
    def get_leads(
        db: Session,
        user_id: int,
    ):

        return (

            db.query(
                Email,
            )

            .filter(
                Email.user_id == user_id,
                Email.lead_score > 0,
            )

            .order_by(
                Email.lead_score.desc(),
            )

            .all()

        )

    # --------------------------------------------------
    # Hot Leads
    # --------------------------------------------------

    @staticmethod
    def get_hot_leads(
        db: Session,
        user_id: int,
    ):

        return (

            db.query(
                Email,
            )

            .filter(
                Email.user_id == user_id,
                Email.lead_score >= 80,
            )

            .order_by(
                Email.lead_score.desc(),
            )

            .all()

        )

    # --------------------------------------------------
    # Warm Leads
    # --------------------------------------------------

    @staticmethod
    def get_warm_leads(
        db: Session,
        user_id: int,
    ):

        return (

            db.query(
                Email,
            )

            .filter(
                Email.user_id == user_id,
                Email.lead_score.between(
                    50,
                    79,
                ),
            )

            .order_by(
                Email.lead_score.desc(),
            )

            .all()

        )

    # --------------------------------------------------
    # Cold Leads
    # --------------------------------------------------

    @staticmethod
    def get_cold_leads(
        db: Session,
        user_id: int,
    ):

        return (

            db.query(
                Email,
            )

            .filter(
                Email.user_id == user_id,
                Email.lead_score < 50,
            )

            .order_by(
                Email.lead_score.desc(),
            )

            .all()

        )

    # --------------------------------------------------
    # Draft Email
    # --------------------------------------------------

    @staticmethod
    def draft_email(
        prompt: str,
    ):

        return email_ai_service.draft_email(
            prompt,
        )

    # --------------------------------------------------
    # Rewrite Email
    # --------------------------------------------------

    @staticmethod
    def rewrite_email(
        email: str,
        tone: str,
    ):

        return email_ai_service.rewrite_email(
            email,
            tone,
        )


email_service = EmailService()