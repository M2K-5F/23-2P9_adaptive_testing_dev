from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from .depends import get_current_active_user
from crud import compare_role, create_topic, follow_topic, get_teacher_topics_by_course, get_followed_topics, change_activity_of_topic
from shemas import UserOut, Roles

topic_router = APIRouter(prefix="/topic", tags=["Topics"])

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