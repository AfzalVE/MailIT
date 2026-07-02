from fastapi import (
    APIRouter,
    Depends,
)

from sqlalchemy.orm import Session


from app.core.database import get_db


from app.modules.auth.auth_schema import (
    RegisterRequest,
    LoginRequest,
    AuthResponse,
)


from app.modules.auth.auth_service import (
    auth_service,
)



router = APIRouter(

    prefix="/auth",

    tags=["Authentication"],

)



@router.post(
    "/register",
    response_model=AuthResponse,
)
def register(

    request: RegisterRequest,

    db: Session = Depends(
        get_db
    ),

):


    result = auth_service.register(

        db,

        request.name,

        request.email,

        request.password,

    )


    return {

        "success": True,

        "message":
        "Registration successful",

        **result

    }





@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(

    request: LoginRequest,

    db: Session = Depends(
        get_db
    ),

):


    result = auth_service.login(

        db,

        request.email,

        request.password,

    )


    return {

        "success": True,

        "message":
        "Login successful",

        **result

    }