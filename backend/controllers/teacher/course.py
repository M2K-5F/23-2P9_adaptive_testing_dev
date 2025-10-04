from fastapi import APIRouter, Depends, HTTPException, Path, status, Query, Body, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from backend.services.teacher.course_service import CourseService
from dependencies.dependencies import get_techer_course_service

from dependencies.user import get_user_from_request
from shemas import UserOut

course_router = APIRouter(prefix='/course', tags=['Teacher/Course'])


class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=64)
    description: str = Field(min_length=3, max_digits=128)


@course_router.post('/create', summary='Create course by teacher')
async def create_course(
    current_user: UserOut = Depends(get_user_from_request),
    data: CourseCreate = Body(),
    service: CourseService = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.create_course(data.title, data.description, current_user)


@course_router.get('/get', summary='Get created by teacher courses')
async def get_teacher_courses(
    current_user = Depends(get_user_from_request),
    service: CourseService = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.get_teacher_courses(current_user)


@course_router.put('/{course_id}/arch', summary='Arch | unarch created by teacher course')
async def arch_course(
    course_id = Path(),
    current_user: UserOut = Depends(get_user_from_request),
    service: CourseService = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.arch_course(course_id, current_user)


@course_router.put('/{course_id}/unarch')
async def unarch_course(
    course_id = Path(),
    current_user: UserOut = Depends(get_user_from_request),
    service: CourseService = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.unarch_course(course_id, current_user)



@course_router.get('/{course_id}/stats')
async def get_statistics(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Path(),
    service: CourseService = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.get_course_statistics(current_user, course_id)