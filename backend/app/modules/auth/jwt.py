from datetime import datetime, timedelta, timezone

from jose import jwt


SECRET_KEY = "YOUR_SECRET_KEY"

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_DAYS = 7



def create_access_token(
    data: dict
):

    payload = data.copy()


    expire = (
        datetime.now(timezone.utc)
        +
        timedelta(
            days=ACCESS_TOKEN_EXPIRE_DAYS
        )
    )


    payload["exp"] = expire


    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )