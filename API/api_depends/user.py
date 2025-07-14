"""Dependencies for views"""


from typing import Union
from fastapi import Cookie, Depends, HTTPException, status, Request

from Config import oauth2_scheme
from Utils import decode_jwt
from shemas import UserOut, Roles
from shared.cruds import find_user


async def get_current_user(
    access_token: Union[str, bytes, None] = Cookie(None, include_in_schema=False),
    bearer_token: Union[str, None]= Depends(oauth2_scheme),
) -> Union[str, None]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Could not validate credentials",
    )
    if not access_token and not bearer_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED
            )

    try:
        token = str(access_token) or bearer_token
        if token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        payload = decode_jwt(token=token)
        username: str = payload.get("sub")

        if username is None:
            raise credentials_exception

    except:
        raise credentials_exception

    return username

async def get_current_active_user(
    request: Request,
    username: str = Depends(get_current_user)
) -> UserOut:

    user = find_user(username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='could not find user'
        )
    
    request.state.userdata = user

    return user


async def is_teacher(user: UserOut = Depends(get_current_active_user)):
    if user.role != Roles.TEACHER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return


async def is_student(user:UserOut = Depends(get_current_active_user)):
    if user.role != Roles.STUDENT:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)


async def get_user_from_request(request: Request):
    return request.state.userdata