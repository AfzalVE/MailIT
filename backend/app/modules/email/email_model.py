from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.database import Base


class Email(Base):

    __tablename__ = "emails"

    # --------------------------------------------------
    # Primary Key
    # --------------------------------------------------

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # --------------------------------------------------
    # Owner
    # --------------------------------------------------

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    # --------------------------------------------------
    # Gmail
    # --------------------------------------------------

    gmail_message_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    sender: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    sender_email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    subject: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    email_body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    # --------------------------------------------------
    # AI Analysis
    # --------------------------------------------------

    ai_summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    score: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    sentiment: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    intent: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    engagement: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    recommended_nudge: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    suggested_responses: Mapped[dict] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )

    # --------------------------------------------------
    # Tracking
    # --------------------------------------------------

    is_read: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    is_clicked: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    click_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # --------------------------------------------------
    # Dates
    # --------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    # --------------------------------------------------
    # Relationship
    # --------------------------------------------------

    user = relationship(
        "User",
        back_populates="emails",
    )