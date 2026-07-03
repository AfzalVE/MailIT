from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# --------------------------------------------------
# Request
# --------------------------------------------------

class AnalyzeEmailRequest(BaseModel):

    sender: Optional[str] = None

    subject: Optional[str] = None

    email: str = Field(
        ...,
        min_length=5,
    )


# --------------------------------------------------
# Suggested Response
# --------------------------------------------------

class SuggestedReply(BaseModel):

    id: str

    subject: str

    body: str

    date: str


class SuggestedResponses(BaseModel):

    replies: list[SuggestedReply] = []


# --------------------------------------------------
# Email Response
# --------------------------------------------------

class EmailResponse(BaseModel):

    id: int

    gmail_message_id: str

    sender: Optional[str]

    sender_email: Optional[str]

    subject: Optional[str]

    email_body: str

    # ---------- AI ----------

    ai_summary: Optional[str]

    score: Optional[str]

    sentiment: int

    intent: int

    engagement: int

    recommended_nudge: Optional[str]

    suggested_responses: SuggestedResponses

    # ---------- Tracking ----------

    is_read: bool

    is_clicked: bool

    click_count: int

    # ---------- Dates ----------

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


# --------------------------------------------------
# Wrapper
# --------------------------------------------------

class AnalyzeEmailResponse(BaseModel):

    success: bool

    message: str

    data: EmailResponse