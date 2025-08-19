from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request
from ..cruds import get_topics_by_course, get_topics_by_followed_course, add_topic_to_user_course, start_topic, submit_topic_answers
from shemas import TopicSubmitAnswers, UserOut, Roles

topic_router = APIRouter(prefix="/topic", tags=["Student/Topics"])


@topic_router.get('/get_followed', summary='Get user topics by followed course')
async def get_followed_teacher_topics(
    current_user: UserOut = Depends(get_user_from_request),
    user_course_id = Query()
) -> JSONResponse:
    return get_topics_by_followed_course(current_user, user_course_id)


@topic_router.post('/add_topic_to_user_course')
async def add_to_course(
    current_user: UserOut = Depends(get_user_from_request),
    topic_id: str = Query()
) -> JSONResponse: 
    return add_topic_to_user_course(current_user, topic_id)


@topic_router.get("/get", summary='Get topics by any course')
def get_teacher_topics(
    current_user: UserOut = Depends(get_user_from_request),
    course_id: str = Query()
) -> JSONResponse:
    return get_topics_by_course(current_user, course_id)


@topic_router.post('/start', summary='Start passing the topic at followed course')
async def start_topic_by_id(
    current_user: UserOut = Depends(get_user_from_request),
    topic_id = Query()
) -> JSONResponse:
    return  start_topic(user=current_user, user_topic_id=topic_id)


@topic_router.post('/submit_topic')
async def submit_topic(
    current_user: UserOut = Depends(get_user_from_request),
    topic_answers_data: TopicSubmitAnswers = Body()
) -> JSONResponse:
    return submit_topic_answers(user=current_user, topic_answers_data=topic_answers_data)