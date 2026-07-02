from sqlalchemy.orm import Session

from .user_model import User



class UserService:


    def get_user_by_id(
        self,
        db:Session,
        user_id:int
    ):

        return (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )



    def get_user_by_email(
        self,
        db:Session,
        email:str
    ):

        return (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )



    def update_user(
        self,
        db:Session,
        user:User,
        name:str
    ):

        user.name = name

        db.commit()

        db.refresh(user)

        return user



user_service = UserService()