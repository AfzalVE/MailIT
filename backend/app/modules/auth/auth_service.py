from sqlalchemy.orm import Session

from passlib.context import CryptContext

from fastapi import HTTPException

from app.modules.user.user_model import User

from app.modules.auth.jwt import (
    create_access_token,
)



password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)



class AuthService:



    def register(
        self,
        db: Session,
        name: str,
        email: str,
        password: str,
    ):


        existing_user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )


        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )


        hashed_password = (
            password_context.hash(
                password
            )
        )


        user = User(

            name=name,

            email=email,

            password=hashed_password,

        )


        db.add(user)

        db.commit()

        db.refresh(user)



        token = create_access_token(

            {
                "user_id": user.id,

                "email": user.email,

            }

        )


        return {

            "user": user,

            "token": {

                "access_token": token,

                "token_type": "bearer",

            }

        }




    def login(
        self,
        db: Session,
        email: str,
        password: str,
    ):


        user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )



        password_valid = (
            password_context.verify(
                password,
                user.password,
            )
        )



        if not password_valid:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
            )



        token = create_access_token(

            {
                "user_id": user.id,

                "email": user.email,

            }

        )



        return {

            "user": user,

            "token": {

                "access_token": token,

                "token_type": "bearer",

            }

        }



auth_service = AuthService()