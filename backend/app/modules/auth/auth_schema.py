from pydantic import (
    BaseModel,
    EmailStr,
    ConfigDict,
)



class RegisterRequest(BaseModel):

    name: str

    email: EmailStr

    password: str



class LoginRequest(BaseModel):

    email: EmailStr

    password: str



class TokenResponse(BaseModel):

    access_token: str

    token_type: str = "bearer"



class UserResponse(BaseModel):

    id: int

    name: str

    email: EmailStr


    model_config = ConfigDict(
        from_attributes=True
    )



class AuthResponse(BaseModel):

    success: bool

    message: str

    user: UserResponse

    token: TokenResponse