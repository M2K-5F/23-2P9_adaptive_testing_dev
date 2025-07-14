from pydantic import BaseModel
from fastapi import Depends, APIRouter, HTTPException, status, Body
from fastapi.responses import JSONResponse
from shemas import UserCreate, UserOut
from..cruds import find_user, create_user, find_password
from Utils import verify_password, encode_jwt
from api_depends import get_current_active_user

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthUser(BaseModel): 
    username: str
    password: str

async def validate_auth_user(
    user: AuthUser = Body()
) -> UserOut:
    current_user = find_user(user.username)
    password_hash = find_password(user.username)

    if not current_user or not verify_password(user.password, password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return current_user


@auth_router.post("/login")
async def login_for_access_token(
    user: UserOut = Depends(validate_auth_user)
) -> JSONResponse:
    jwt_payload = {
        "sub": user.username,
        "username": user.username
    }
    
    token = encode_jwt(jwt_payload)
    response = JSONResponse(
        content={
            'username': user.name, 
            'role': user.role, 
            "token": token
        }
    )

    response.set_cookie(
        key='access_token',
        value=str(token),
        path="/",
        httponly=True,
        max_age=3600*24*30
    )

    return response


@auth_router.get('/users/me')
async def users_me(
    user = Depends(get_current_active_user)
) -> JSONResponse: 
    return JSONResponse(
        content={
            'nick': user.name, 
            'status': user.role, 
        }
    )

@auth_router.post('/logout')
async def logout():
    response = JSONResponse(
        'logout: true'
    )
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
    )
    
    return response


@auth_router.post("/register")
async def register(user: UserCreate) -> str:
    user_data = create_user(user)
    return user_data
