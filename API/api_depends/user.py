"""Dependencies for views"""


from typing import Union
from fastapi import Cookie, Depends, HTTPException, status, Request

from Config import oauth2_scheme
from Utils import decode_jwt
from shemas import UserOut, Roles
from shared.cruds import get_user


async def get_user_from_request(request: Request):
    return request.state.user


async def is_teacher(user: UserOut = Depends(get_user_from_request)):
    if Roles.TEACHER not in user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return


async def is_student(user:UserOut = Depends(get_user_from_request)):
    if Roles.STUDENT not in user.roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return