from sqlalchemy.orm import Session

from app.ai.groq_client import groq_client
from app.modules.email.email_model import Email


class EmailService:

    @staticmethod
    def analyze_email(
        db: Session,
        user_id: int,
        email_body: str,
        sender: str | None = None,
        subject: str | None = None,
    ) -> Email:

        analysis = groq_client.analyze_email(email_body)

        email = Email(
            user_id=user_id,
            sender=sender,
            subject=subject,
            email_body=email_body,
            smart_reply=analysis.get("reply", ""),
            sentiment=analysis.get("sentiment", "Neutral"),
            category=analysis.get("category", "General"),
            lead_status=analysis.get("lead_status", "No"),
            lead_score=int(analysis.get("lead_score", 0)),
            lead_stage=analysis.get("lead_stage", "None"),
        )

        db.add(email)
        db.commit()
        db.refresh(email)

        return email

    @staticmethod
    def get_user_email_history(
        db: Session,
        user_id: int,
    ) -> list[Email]:

        return (
            db.query(Email)
            .filter(
                Email.user_id == user_id
            )
            .order_by(
                Email.created_at.desc()
            )
            .all()
        )

    @staticmethod
    def get_user_leads(
        db: Session,
        user_id: int,
    ) -> list[Email]:
        """
        Returns only emails that are considered leads.
        Adjust the filtering logic to match your business rules.
        """

        return (
            db.query(Email)
            .filter(
                Email.user_id == user_id,
                Email.lead_status != "No",
            )
            .order_by(
                Email.lead_score.desc(),
                Email.created_at.desc(),
            )
            .all()
        )

    @staticmethod
    def get_hot_leads(
        db: Session,
        user_id: int,
    ) -> list[Email]:

        return (
            db.query(Email)
            .filter(
                Email.user_id == user_id,
                Email.lead_score >= 80,
            )
            .order_by(
                Email.lead_score.desc(),
            )
            .all()
        )

    @staticmethod
    def get_warm_leads(
        db: Session,
        user_id: int,
    ) -> list[Email]:

        return (
            db.query(Email)
            .filter(
                Email.user_id == user_id,
                Email.lead_score.between(50, 79),
            )
            .order_by(
                Email.lead_score.desc(),
            )
            .all()
        )

    @staticmethod
    def get_cold_leads(
        db: Session,
        user_id: int,
    ) -> list[Email]:

        return (
            db.query(Email)
            .filter(
                Email.user_id == user_id,
                Email.lead_score < 50,
            )
            .order_by(
                Email.lead_score.desc(),
            )
            .all()
        )


email_service = EmailService()