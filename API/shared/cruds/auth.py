from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import (database, User, UserRole, Role, 
    Course, Answer, Question,
    Topic, UserCourse, UserQuestion, UserTopic
)
from Utils import get_password_hash
from shemas import UserCreate, Roles, UserOut, QuestionBase, AnswerOptionBase


@database.atomic()
def create_user(user: UserCreate):
    try:
        currect_user = User.create(
            username=user.username,
            name=user.name,
            telegram_link=user.telegram_link,
            password_hash=get_password_hash(user.password)
        )

        UserRole.create(
            user = currect_user,
            role = Role.get_or_none(Role.status == user.role)
        )

    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already registered"
        )

    return "Username registered"


@database.atomic()
def find_user(username) :
    current_user = User.get_or_none(User.username == username)
    if not current_user:
        raise HTTPException(
            detail='user not finded',
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    user_role = (UserRole.get_or_none(UserRole.user == current_user)).role.status
    return UserOut(
        username=current_user.username,
        name=current_user.name,
        telegram_link=current_user.telegram_link,
        role=user_role
    )


@database.atomic()
def find_password(username):
    current_user = User.get_or_none(User.username == username)

    if current_user:
        return current_user.password_hash
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="user not finded"
    )