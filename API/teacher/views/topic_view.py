from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request
from ..cruds import create_topic, change_activity_of_topic
from shemas import UserOut

topic_router = APIRouter(prefix="/topic", tags=["Teacher/Topics"])

@topic_router.post('/create')
def create_teacher_topic(
    current_user: UserOut = Depends(get_user_from_request),
    topic_title = Query("topic"),
    description = Query("some_description"),
    course_id = Query()
) -> JSONResponse:

    return create_topic(current_user, topic_title, description, course_id)


@topic_router.put('/arch')
def arch_topic(
    current_user = Depends(get_user_from_request),
    topic_id: str = Query(),
) -> JSONResponse:
    return change_activity_of_topic(current_user, topic_id)
