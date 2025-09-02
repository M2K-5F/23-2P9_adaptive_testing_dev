from pydantic import BaseModel
from fastapi import Depends, APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from shemas import UserCreate, UserOut
from..cruds import get_user, create_user, get_password
from Utils import verify_password, encode_jwt
from datetime import datetime, timedelta, timezone
from api_depends import get_user_from_request
from typing import Tuple
from playhouse.shortcuts import model_to_dict

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthUser(BaseModel): 
    username: str
    password: str
    is_remember: bool = False


class AuthOut(UserOut):
    is_remember: bool


async def validate_auth_user(
    user: AuthUser = Body()
) -> AuthOut:
    current_user = get_user(user.username)
    password_hash = get_password(user.username)

    if not current_user or not verify_password(user.password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return AuthOut(**current_user.model_dump(), is_remember=user.is_remember)


@auth_router.post("/login")
async def login_for_access_token(
    current_user: AuthOut = Depends(validate_auth_user)
) -> JSONResponse:
    expires_delta = timedelta(days=30) if current_user.is_remember else timedelta(minutes=15)
    now = datetime.now(timezone.utc)
    expires_at = now + expires_delta
    
    jwt_payload = {
        "sub": current_user.username,
        'exp': expires_at,
        "iat": now
    }
    token = encode_jwt(jwt_payload)
    response = JSONResponse(current_user.model_dump())

    response.set_cookie(
        key='access_token',
        value=str(token),
        path="/",
        httponly=True,
        max_age=int(expires_delta.total_seconds())
    )

    return response


@auth_router.get('/users/me')
async def users_me(
    user: UserOut = Depends(get_user_from_request)
) -> JSONResponse: 
    return JSONResponse(user.model_dump())

@auth_router.post('/logout')
async def logout():
    response = JSONResponse(
        {'detail': 'Successfull logout'}
    )
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
    )
    
    return response


@auth_router.post("/register")
async def register(user: UserCreate) -> str:
    return create_user(user)
