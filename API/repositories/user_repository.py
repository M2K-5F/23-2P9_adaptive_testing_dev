from typing import Literal
from db import Role, User, UserRole
from peewee import IntegrityError
from fastapi import status, HTTPException
from shemas import Roles, UserOut
from .base.base_repository import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def create_user(
        self, 
        username: str, 
        name: str, 
        telegram_link: str, 
        password_hash:str, 
        role: Literal['teacher', 'student']
    ) -> User:
        try:
            currect_user = self.model.create(
                username=username,
                name=name,
                telegram_link=telegram_link,
                password_hash=password_hash
            )

            if role == Roles.TEACHER:
                UserRole.create(
                    user = currect_user,
                    role = Role.get_or_none(Role.status == Roles.TEACHER)
                )
                
            UserRole.create(
                user = currect_user,
                role = Role.get_or_none(Role.status == Roles.STUDENT)
            )

        except IntegrityError:
            raise self.integrity_exc

        return currect_user

    def get_user_by_username(self, username: str) -> UserOut:
        current_user = self.get_or_none(False, username=username)
        if not current_user:
            raise HTTPException(
                status.HTTP_401_UNAUTHORIZED,
                f'User with name {username} not found'
            )
        
        user_roles = UserRole.select().where(UserRole.user == current_user)
        user_roles = [role.role.status for role in user_roles]

        return UserOut(
            username=str(current_user.username),
            name=str(current_user.name),
            telegram_link=str(current_user.telegram_link),
            roles=user_roles
        )

    def get_password_hash_by_username(self, username: str) -> str:
        return str(self.get_or_none(True, username=username).password_hash)