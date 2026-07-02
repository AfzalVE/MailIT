from datetime import datetime

from sqlalchemy import (
    String,
    Integer,
    DateTime,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.core.database import Base


class User(Base):

    __tablename__ = "users"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )


    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )


    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )


    password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )


    emails = relationship(
        "Email",
        back_populates="user",
        cascade="all, delete",
    )