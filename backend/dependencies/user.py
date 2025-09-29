"""Dependencies for views"""
from fastapi import Cookie, Depends, HTTPException, status, Request
from shemas import UserOut, Roles


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