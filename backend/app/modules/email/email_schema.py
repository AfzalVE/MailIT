from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)



class AnalyzeEmailRequest(BaseModel):

    sender: Optional[str] = Field(
        default=None,
        description="Sender name or email address",
    )


    subject: Optional[str] = Field(
        default=None,
        description="Email subject",
    )


    email: str = Field(
        ...,
        min_length=10,
        description="Original email content",
    )



class AnalyzeEmailResponse(BaseModel):

    success: bool

    message: str

    data: "EmailResponse"



class EmailResponse(BaseModel):

    id: int

    sender: Optional[str]

    subject: Optional[str]

    email_body: str

    smart_reply: str

    sentiment: str

    category: str

    lead_status: str

    lead_score: int

    lead_stage: str

    created_at: datetime


    model_config = ConfigDict(
        from_attributes=True
    )