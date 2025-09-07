from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import JSONResponse
from services.student.course_service import CourseService
from dependencies.dependencies import get_student_course_service

from dependencies.user import get_user_from_request
from shemas import UserOut

course_router = APIRouter(prefix='/course', tags=["Student/Course"])

@course_router.get('/get_followed', summary='Get user courses')
async def get_followed_teacher_courses(
    current_user = Depends(get_user_from_request),
    course_service: CourseService = Depends(get_student_course_service)
) -> JSONResponse:
    return course_service.get_followed_courses(current_user)

@course_router.post("/follow")
def follow_teacher_course(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query(),
    course_service: CourseService = Depends(get_student_course_service)
) -> JSONResponse:
    return course_service.follow_course(current_user, course_id)


@course_router.delete('/unfollow')
def unfollow_teacher_course(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query(),
    course_service: CourseService = Depends(get_student_course_service)
) -> JSONResponse:
    return course_service.unfollow_course(current_user, course_id)

@course_router.get('/get_by_id', summary="Get course, is_followed by course_id")
async def get_course(
    course_id = Query(),
    current_user = Depends(get_user_from_request),
    course_service: CourseService = Depends(get_student_course_service)
) -> JSONResponse:
    return course_service.get_course_by_id(user=current_user, course_id=course_id)


@course_router.delete('/clear')
async def clear_progress(
    current_user = Depends(get_user_from_request),
    user_course_id = Query(),
    course_service: CourseService = Depends(get_student_course_service)
):
    return course_service.clear_user_course_progress(current_user, user_course_id)