from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from dependencies.user import get_user_from_request
from dependencies.dependencies import get_teacher_group_service, get_teacher_question_service, TQS
from services.teacher.group import GroupService
from shemas import UserOut, Roles, QuestionBase


group_router = APIRouter(prefix='/group', tags=['Teacher/Group'])


@group_router.post('/create')
def create_group(
    current_user = Depends(get_user_from_request),
    service: GroupService = Depends(get_teacher_group_service),
    course_id: int = Query(),
    title: str = Query(),
    max_count: int = Query()
) -> JSONResponse:
    return service.create_group(
        course_id,
        current_user, 
        title,
        max_count
    )


@group_router.get('/get')
def get_groups(
    current_user = Depends(get_user_from_request),
    service: GroupService = Depends(get_teacher_group_service),
    course_id: int = Query()
) -> JSONResponse:
    return service.get_teacher_groups(current_user, course_id)


@group_router.get('/arch')
def arch_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Query(),
    service: GroupService = Depends(get_teacher_group_service)
) -> JSONResponse:
    return service.arch_group(current_user, group_id)


@group_router.get('/unarch')
def unarch_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Query(),
    service: GroupService = Depends(get_teacher_group_service)
) -> JSONResponse:
    return service.unarch_group(current_user, group_id)