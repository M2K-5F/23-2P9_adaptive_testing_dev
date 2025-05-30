"""descriptions for all user interactions (API)"""
import datetime 
from typing import Annotated
import secrets
from pydantic import BaseModel
from fastapi import Depends, APIRouter, HTTPException, status, Form, Response, Cookie, Request, Body 
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, \
                            HTTPBasicCredentials, HTTPBasic, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from passlib.context import CryptContext

from shemas import (
    UserCreate, Token,
    UserOut, Poll, PollCreate,
    PollAnswersSubmit, PollWithQuestions
    )
from crud import find_user, create_user, create_poll, find_password, find_polls, \
                find_questions, submit_poll_answers, check_user_answers_from_db, find_poll
from utils import verify_password, encode_jwt, decode_jwt


router = APIRouter(prefix="/auth", tags=["Auth"])


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class AuthUser(BaseModel): 
    username: str
    password: str

async def validate_auth_user(
    user: AuthUser = Body()
) -> UserOut:
    data = await find_user(user.username)
    password_hash = await find_password(user.username)

    if not data or not verify_password(user.password, password_hash):
        raise HTTPException(status_code=401)

    return UserOut(**data)


async def get_current_user(
    access_token: str|bytes = Cookie(None, include_in_schema=False)
) -> str:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )
    try:
        payload = decode_jwt(access_token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

    except:
        raise credentials_exception

    return username


async def get_current_active_user(
    username: str = Depends(get_current_user),
) -> UserOut:
    
    user = await find_user(username)

    if not user:
        raise HTTPException(
            status_code=403,
            detail='hyinya'
        )

    if user["is_active"]:
        return UserOut(**user)
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="user inactive"
    )


@router.post("/login")
async def login_for_access_token(
    user: UserCreate = Depends(validate_auth_user)
) -> JSONResponse:
    jwt_payload = {
        "sub": user.username,
        "username": user.username
    }
    token = encode_jwt(jwt_payload)
    response = JSONResponse(content={'username': user.name, 'role': user.role})
    response.set_cookie(
        key='access_token',
        value=token,
        path="/",
        httponly=True,
        max_age=3600*24*30
    )
    return  response


@router.post("/register")
async def register(user: UserCreate) -> str:
    print(user)
    user_data = await create_user(user)
    return user_data


@router.post("/create_poll")
async def create_full_poll(
    poll_data: PollCreate,
    current_user: Annotated[UserOut, Depends(get_current_active_user)]
):
    if current_user.role == "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )

    db_poll = await create_poll(poll_data, current_user)

    return db_poll


@router.get('/ping_poll/{poll_id}')
async def ping_poll(
    poll_id: int,
    current_user: UserCreate = Depends(get_current_active_user)
):
    if current_user.role == "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only studens can see questions"
        )
    return await find_poll(poll_id)


@router.get("/get_poll/{poll_id}", response_model=PollWithQuestions)
async def get_poll_questions(
    poll_id: int,
    current_user: UserOut = Depends(get_current_active_user)
):
    if current_user.role == "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only studens can see questions"
        )
    content = await find_questions(poll_id)

    return JSONResponse(content=content)


@router.post("/polls/{poll_id}/submit-answers/")
async def submit_answers(
    poll_id: int,
    answers_data: PollAnswersSubmit,
    current_user: UserOut = Depends(get_current_active_user)
):
    # Проверяем, что пользователь - студент
    if current_user.role == "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit answers"
        )

    return submit_poll_answers(poll_id, answers_data, current_user)


@router.get("/polls/check")
async def check_statistic(
    current_user: UserOut = Depends(get_current_active_user)
) -> dict:
    if current_user.role == 'student':
        raise HTTPException(
            status_code=403, 
            detail='Only teachers can see stats'
        )
    return check_user_answers_from_db(current_user.username)
