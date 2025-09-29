from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from services.student.topic_service import TopicService
from dependencies.user import get_user_from_request
from dependencies.dependencies import get_student_topic_service
from shemas import TopicSubmitAnswers, UserOut, Roles

topic_router = APIRouter(prefix="/topic", tags=["Student/Topics"])


@topic_router.get('/get_followed', summary='Get user topics by followed course')
async def get_followed_teacher_topics(
    current_user: UserOut = Depends(get_user_from_request),
    user_course_id = Query(),
    topic_service: TopicService = Depends(get_student_topic_service)
) -> JSONResponse:
    return topic_service.get_user_topics_by_user_group(current_user, user_course_id)


@topic_router.get("/get", summary='Get topics by any course')
async def get_teacher_topics(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query(),
    topic_service: TopicService = Depends(get_student_topic_service)
) -> JSONResponse:
    return topic_service.get_topics_by_course(course_id)


@topic_router.post('/start', summary='Start passing the topic at followed course')
async def start_topic_by_id(
    current_user: UserOut = Depends(get_user_from_request),
    topic_id = Query(),
    topic_service: TopicService = Depends(get_student_topic_service)
) -> JSONResponse:
    return topic_service.start_topic_by_user_topic(user=current_user, user_topic_id=topic_id)


@topic_router.post('/submit_topic')
async def submit_topic(
    current_user: UserOut = Depends(get_user_from_request),
    topic_answers_data: TopicSubmitAnswers = Body(),
    topic_service: TopicService = Depends(get_student_topic_service)
) -> JSONResponse:
    return topic_service.sumbit_topic_answers(current_user, topic_answers_data)