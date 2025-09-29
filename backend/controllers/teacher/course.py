from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import JSONResponse
from dependencies.dependencies import get_techer_course_service, TCS

from dependencies.user import get_user_from_request
from shemas import UserOut

course_router = APIRouter(prefix='/course', tags=['Teacher/Course'])


@course_router.post('/create', summary='Create course by teacher')
async def create_course(
    current_user: UserOut = Depends(get_user_from_request),
    course_title = Query(default="course"),
    course_description = Query(default='description'),
    service: TCS = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.create_course(course_title, course_description, current_user)


@course_router.get('/get', summary='Get created by teacher courses')
async def get_teacher_courses(
    current_user = Depends(get_user_from_request),
    service: TCS = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.get_teacher_courses(current_user)


@course_router.put('/arch', summary='Arch | unarch created by teacher course')
async def arch_course(
    course_id = Query(default="course"),
    current_user: UserOut = Depends(get_user_from_request),
    service: TCS = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.arch_course(course_id, current_user)


@course_router.put('/unarch')
async def unarch_course(
    course_id = Query(default="course"),
    current_user: UserOut = Depends(get_user_from_request),
    service: TCS = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.unarch_course(course_id, current_user)



@course_router.get('/stats')
async def get_statistics(
    current_user: UserOut = Depends(get_user_from_request),
    course_id = Query(),
    service: TCS = Depends(get_techer_course_service)
) -> JSONResponse:
    return service.get_course_statistics(current_user, course_id)