"""descriptions for all user interactions (API)"""
from pydantic import BaseModel
from fastapi import Depends, APIRouter, HTTPException, status, Cookie, Body, Query 
from fastapi.security import OAuth2PasswordBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from typing import Union

from shemas import (
    UserCreate, UserOut, Course, Roles,
    QuestionBase, AnswerOptionBase
)
from crud import (
    find_user, create_user, find_password, 
    compare_role, course_create, change_activity_of_course, 
    get_courses_list, create_topic, get_teacher_topics_by_course,
    change_activity_of_topic, create_question, get_question_list,
    arch_question, follow_course, follow_topic, get_followed_courses,
    get_followed_topics
)
from utils import verify_password, encode_jwt, decode_jwt
from db import User, UserRole, Role, UserCourse


auth_router = APIRouter(prefix="/auth", tags=["Auth"])
course_router = APIRouter(prefix='/course', tags=["Courses"])
topic_router = APIRouter(prefix="/topic", tags=["Topics"])
question_router = APIRouter(prefix="/quetion", tags=["Questions"])

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login", 
    auto_error=False
)

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
        token = access_token or bearer_token
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
    username: str = Depends(get_current_user)
) -> UserOut:

    user = find_user(username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='could not find user'
        )

    return user


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

# @router.post("/create_poll")
# async def create_full_poll(
#     poll_data: PollCreate,
#     current_user: UserOut = Depends(get_current_active_user)
# ) -> JSONResponse:
#     if compare_role(current_user.username, Roles.STUDENT):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only teachers can create polls"
#         )

#     db_poll = await create_poll(poll_data, current_user)

#     return db_poll


# @router.get('/ping_poll/{poll_id}')
# async def ping_poll(
#     poll_id: int,
#     current_user: UserOut = Depends(get_current_active_user)
# ) -> JSONResponse:
#     if compare_role(current_user.username, Roles.TEACHER):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only studens can see questions"
#         )

#     return find_poll(poll_id)


# @router.get("/get_poll/{poll_id}", response_model=PollWithQuestions)
# async def get_poll_questions(
#     poll_id: int,
#     current_user: UserOut = Depends(get_current_active_user)
# ) -> JSONResponse:
#     if compare_role(current_user.username, Roles.TEACHER):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only studens can see questions"
#         )

#     return await find_questions(poll_id)


# @router.post("/polls/{poll_id}/submit-answers/")
# async def submit_answers(
#     poll_id: int,
#     answers_data: PollAnswersSubmit,
#     current_user: UserOut = Depends(get_current_active_user)
# ) -> JSONResponse:
#     if compare_role(current_user.username, Roles.TEACHER):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Only students can submit answers"
#         )

#     return submit_poll_answers(poll_id, answers_data, current_user)


# @router.get("/polls/check")
# async def check_statistic(
#     current_user: UserOut = Depends(get_current_active_user)
# ) -> JSONResponse:
#     if compare_role(current_user.username, Roles.STUDENT):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, 
#             detail='Only teachers can see stats'
#         )

#     return check_user_answers_from_db(current_user.username)


@course_router.post('/create')
async def create_course(
    current_user: UserOut = Depends(get_current_active_user),
    course_title = Query(default="course")
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )

    return course_create(course_title, user=current_user)


@course_router.get('/get')
async def get_teacher_courses(
    current_user = Depends(get_current_active_user)
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )
    
    return get_courses_list(current_user)


@course_router.get('/get_followed')
async def get_followed_teacher_courses(
    current_user = Depends(get_current_active_user)
) -> JSONResponse:
    return get_followed_courses(current_user)


@course_router.put('/arch')
async def arch_course(
    course_id = Query(default="course"),
    current_user: UserOut = Depends(get_current_active_user)
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )

    return change_activity_of_course(course_id=course_id, user=current_user)

    
@course_router.post("/follow")
def follow_teacher_course(
    current_user: UserOut = Depends(get_current_active_user),
    course_id = Query()
) -> JSONResponse:
    return follow_course(current_user, course_id)


@course_router.delete('/unfollow')
def unfollow_teacher_course(
    current_user: UserOut = Depends(get_current_active_user),
    course_id = Query()
) -> JSONResponse:
    return follow_course(current_user, course_id, True)


@topic_router.post('/create')
def create_teacher_topic(
    current_user: UserOut = Depends(get_current_active_user),
    topic_title = Query("topic"),
    description = Query("some_description"),
    course_id = Query()
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )

    return create_topic(current_user, topic_title, description, course_id)


@topic_router.get("/get")
def get_teacher_topics(
    current_user: UserOut = Depends(get_current_active_user),
    course_id: str = Query()
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )

    return get_teacher_topics_by_course(current_user, course_id)


@topic_router.get('/get_followed')
async def get_followed_teacher_topics(
    current_user: UserOut = Depends(get_current_active_user),
    course_id = Query()
) -> JSONResponse:
    return get_followed_topics(current_user, course_id)


@topic_router.put('/arch')
def arch_topic(
    current_user = Depends(get_current_active_user),
    topic_id: str = Query(),
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return change_activity_of_topic(current_user, topic_id)


@topic_router.post("/follow")
def follow_teacher_topic(
    current_user = Depends(get_current_active_user),
    topic_id = Query()
) -> JSONResponse:
    return follow_topic(current_user, topic_id)


@topic_router.delete('/unfollow')
def unfollow_teacher_topic(
    current_user = Depends(get_current_active_user),
    topic_id = Query()
) -> JSONResponse:
    return follow_topic(current_user, topic_id, True)

    
@question_router.post('/create')
def create_teacher_question(
    current_user = Depends(get_current_active_user),
    topic_id = Query(),
    question: QuestionBase = Body()
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return create_question(current_user, topic_id, question)


@question_router.get('/get')
def get_questions(
    current_user = Depends(get_current_active_user),
    topic_id = Query(),
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return get_question_list(current_user, topic_id)


@question_router.put('/acrh')
def arch_teacher_question(
    current_user = Depends(get_current_active_user),
    question_id = Query(),
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create topics"
        )
    
    return arch_question(current_user, question_id)