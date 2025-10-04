from pydantic import BaseModel
from fastapi import Depends, APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from backend.services.common.user_service import UserService
from shemas import UserCreate, UserOut
from utils import verify_password, encode_jwt
from datetime import datetime, timedelta, timezone
from dependencies.user import get_user_from_request
from dependencies.dependencies import get_user_service

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthUser(BaseModel): 
    username: str
    password: str
    is_remember: bool = False


class AuthOut(UserOut):
    is_remember: bool


async def validate_auth_user(
    user: AuthUser = Body(),
    repo: UserService = Depends(get_user_service)
) -> AuthOut:
    current_user = repo.get_user_by_username(user.username)
    password_hash = repo.get_password_hash_by_username(user.username)

    if not current_user or not verify_password(user.password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return AuthOut(
        **current_user.model_dump(), 
        is_remember = user.is_remember
    )


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
    user: UserOut = Depends(get_user_from_request),
) -> JSONResponse: 
    return JSONResponse(user.model_dump())


@auth_router.post('/logout')
async def logout() -> JSONResponse:
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
async def register(
    user: UserCreate = Body(),
    servise: UserService = Depends(get_user_service)
) -> JSONResponse:
    return servise.create_user(user.username, user.name, user.telegram_link, user.password, user.role)