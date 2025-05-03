"""descriptions for all user interactions (API)"""
import datetime 
from typing import Annotated
import secrets
import jwt
from fastapi import Depends, APIRouter, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm, \
                             HTTPBasicCredentials, HTTPBasic, HTTPAuthorizationCredentials
from passlib.context import CryptContext

from shemas import (
    UserCreate, Token,
    UserOut, Poll, PollCreate,
    PollAnswersSubmit, PollWithQuestions
    )
from crud import find_user, create_user, create_poll, find_password, find_polls, \
                 find_questions, submit_poll_answers, check_user_answers_from_db
from utils import verify_password, encode_jwt, decode_jwt


router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def validate_auth_user(
    username: str = Form(),
    password: str = Form(),
) -> UserOut:
    data = await find_user(username)
    unauthed_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid username or password",
        headers={"WWW-Authenticate": "Basic"},
        )
    password_hash = await find_password(username)

    if not data or not verify_password(password, password_hash):
        raise unauthed_exc

    return UserOut(**data)


async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_jwt(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

    except:
        raise credentials_exception

    return username


async def get_current_active_user(
    username: str = Depends(get_current_user)
) -> UserOut:
    user = await find_user(username)

    if user["is_active"]:
        return UserOut(**user)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="user inactive"
    )


@router.get("/users/me")
async def read_users_me(
    current_user: Annotated[UserOut, Depends(get_current_active_user)]
) -> UserOut:
    return current_user


@router.post("/login")
async def login_for_access_token(
    user: UserCreate = Depends(validate_auth_user),
) -> Token:
    jwt_payload = {
        "sub": user.username,
        "username": user.username
    }
    token = encode_jwt(jwt_payload)

    return Token(access_token=token, token_type="bearer")


@router.post("/register")
async def register(user: UserCreate) -> str:
    user_data = await create_user(user)

    return user_data


@router.post("/polls")
async def create_full_poll(
    poll_data: PollCreate,
    current_user: Annotated[UserOut, Depends(get_current_active_user)]
):
    if current_user.role == "Role.TEACHER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )

    db_poll = await create_poll(poll_data, current_user)

    return db_poll


@router.get("/polls")
async def get_polls(current_user: Annotated[UserOut, Depends(get_current_active_user)]
) -> list[Poll]:
    if current_user.role == "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only studens can see polls"
        )
    polls = await find_polls()

    return polls


@router.get("/polls/{poll_id}/questions/", response_model=PollWithQuestions)
async def get_poll_questions(
    poll_id: int,
    current_user: UserOut = Depends(get_current_active_user)
):
    if current_user.role == "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only studens can see questions"
        )
    return await find_questions(poll_id)


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


@router.get("/polls/{poll_id}/submit-answers/username")
async def check_answers(
    poll_id: int,
    username: str,
    current_user: UserOut = Depends(get_current_active_user)
):

    return check_user_answers_from_db(poll_id, username)
