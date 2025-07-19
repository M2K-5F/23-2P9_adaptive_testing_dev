from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request
from ..cruds import course_create, get_created_by_teacher_courses, change_activity_of_course
from shemas import UserOut

course_router = APIRouter(prefix='/course', tags=['Teacher/Course'])


@course_router.post('/create', summary='Create course by teacher')
async def create_course(
    current_user: UserOut = Depends(get_user_from_request),
    course_title = Query(default="course")
) -> JSONResponse:
    return course_create(course_title, user=current_user)


@course_router.get('/get', summary='Get created by teacher courses')
async def get_teacher_courses(
    current_user = Depends(get_user_from_request)
) -> JSONResponse:
    
    return get_created_by_teacher_courses(current_user)


@course_router.put('/arch', summary='Arch | unarch created by teacher course')
async def arch_course(
    course_id = Query(default="course"),
    current_user: UserOut = Depends(get_user_from_request)
) -> JSONResponse:
    return change_activity_of_course(course_id=course_id, user=current_user)