from fastapi import APIRouter, Depends, HTTPException, Path, status, Query, Body
from fastapi.responses import JSONResponse

from dependencies.user import get_user_from_request
from dependencies.dependencies import get_teacher_group_service
from services.teacher.group import GroupService
from shemas import GroupToCreate, UserOut, Roles, QuestionBase


group_router = APIRouter(prefix='/group', tags=['Teacher/Group'])


@group_router.post('/create')
async def create_group(
    current_user = Depends(get_user_from_request),
    data: GroupToCreate = Body(),
    service: GroupService = Depends(get_teacher_group_service),
) -> JSONResponse:
    return service.create_group(
        data,
        current_user, 
    )


@group_router.get('/{course_id}/get')
async def get_groups(
    current_user = Depends(get_user_from_request),
    service: GroupService = Depends(get_teacher_group_service),
    course_id: int = Path()
) -> JSONResponse:
    return service.get_teacher_groups(current_user, course_id)


@group_router.put('/{group_id}/arch')
async def arch_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Path(),
    service: GroupService = Depends(get_teacher_group_service)
) -> JSONResponse:
    return service.arch_group(current_user, group_id)


@group_router.put('/{group_id}/unarch')
async def unarch_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Path(),
    service: GroupService = Depends(get_teacher_group_service)
) -> JSONResponse:
    return service.unarch_group(current_user, group_id)


@group_router.get('/{group_id}/weights')
async def get_weights_by_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Path(),
    service: GroupService = Depends(get_teacher_group_service)
) -> JSONResponse:
    return service.get_question_weights_by_group(group_id, current_user)