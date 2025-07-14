from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request
from ..cruds import get_followed_courses, follow_course, get_course_by_id
from shemas import UserOut, Roles

course_router = APIRouter(prefix='/course', tags=["Student/Course"])

@course_router.get('/get_followed')
async def get_followed_teacher_courses(
    current_user = Depends(get_user_from_request)
) -> JSONResponse:
    return get_followed_courses(current_user)

@course_router.post("/follow")
def follow_teacher_course(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query()
) -> JSONResponse:
    return follow_course(current_user, course_id)


@course_router.delete('/unfollow')
def unfollow_teacher_course(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query()
) -> JSONResponse:
    return follow_course(current_user, course_id, True)

@course_router.get('/get_by_id')
async def get_course(
    course_id = Query(),
    current_user = Depends(get_user_from_request)
) -> JSONResponse:
    return get_course_by_id(user=current_user, courseId=course_id)