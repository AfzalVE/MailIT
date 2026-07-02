from datetime import datetime

from sqlalchemy import (
    DateTime,
    Integer,
    String,
    Text,
    ForeignKey,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.database import Base


class Email(Base):

    __tablename__ = "emails"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )


    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )


    sender: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )


    subject: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )


    email_body: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    smart_reply: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    sentiment: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Neutral",
    )


    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="General",
    )


    lead_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="No",
    )


    lead_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )


    lead_stage: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="None",
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


    user = relationship(
        "User",
        back_populates="emails",
    )