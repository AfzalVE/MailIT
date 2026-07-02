from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session


from app.core.database import get_db

from app.modules.auth.dependencies import (
    get_current_user
)

from .user_schema import (
    UserResponse,
    UpdateUserRequest,
)



router = APIRouter(
    prefix="/users",
    tags=["Users"],
)



@router.get(
    "/me",
    response_model=UserResponse,
)
def get_profile(
    current_user = Depends(
        get_current_user
    )
):

    return current_user



@router.put(
    "/me",
    response_model=UserResponse,
)
def update_profile(
    request:UpdateUserRequest,
    current_user = Depends(
        get_current_user
    ),
    db:Session = Depends(
        get_db
    ),
):

    current_user.name = request.name

    db.commit()

    db.refresh(
        current_user
    )

    return current_user