from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request
from ..cruds import follow_topic, get_followed_topics, get_teacher_topics_by_course
from shemas import UserOut, Roles

topic_router = APIRouter(prefix="/topic", tags=["Student/Topics"])


@topic_router.get('/get_followed')
async def get_followed_teacher_topics(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query()
) -> JSONResponse:
    return get_followed_topics(current_user, course_id)


@topic_router.get("/get")
def get_teacher_topics(
    current_user: UserOut = Depends(get_user_from_request),
    course_id: str = Query()
) -> JSONResponse:
    return get_teacher_topics_by_course(current_user, course_id)


@topic_router.post("/follow")
def follow_teacher_topic(
    current_user = Depends(get_user_from_request),
    topic_id = Query()
) -> JSONResponse:
    return follow_topic(current_user, topic_id)


@topic_router.delete('/unfollow')
def unfollow_teacher_topic(
    current_user = Depends(get_user_from_request),
    topic_id = Query()
) -> JSONResponse:
    return follow_topic(current_user, topic_id, True)