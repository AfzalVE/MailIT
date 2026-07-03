from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
)


class OAuthAccountResponse(BaseModel):
    id: int

    provider: str

    provider_email: str | None

    connected: bool

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class OAuthStatusResponse(BaseModel):
    connected: bool

    provider: str | None = None

    provider_email: str | None = None