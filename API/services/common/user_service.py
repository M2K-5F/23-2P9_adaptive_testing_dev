from typing import Literal
from fastapi.responses import JSONResponse
from utils import get_password_hash
from models import User, database
from repositories.user_repository import UserRepository

class UserService:
    """Service management users"""

    def __init__(
        self, 
        user_repo: UserRepository
    ):
        self._user_repo = user_repo


    @database.atomic()
    def create_user(
        self, 
        username: str, 
        name: str, 
        telegram_link: str, 
        password:str, 
        role: Literal['teacher', 'student']
    ) -> JSONResponse:
        created_user = self._user_repo.create_user(
            username,
            name,
            telegram_link, 
            get_password_hash(password),
            role
        )

        return JSONResponse(created_user.dump)


    @database.atomic()
    def get_user_by_username(self, username: str):
        return self._user_repo.get_user_by_username(username)


    @database.atomic()
    def get_password_hash_by_username(self, username: str):
        return self._user_repo.get_password_hash_by_username(username)