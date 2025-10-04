from fastapi import APIRouter, Depends, HTTPException, Path, status, Query, Body, Request
from fastapi.responses import JSONResponse
from pydantic import Json
from services.common.progress_service import ProgressService
from services.student.group import GroupService
from dependencies.dependencies import get_progress_service, get_student_group_service

from dependencies.user import get_user_from_request
from shemas import UserOut

group_router = APIRouter(prefix='/group', tags=["Student/group"])


@group_router.get('/{course_id}/get')
async def get_group_list(
    current_user: UserOut = Depends(get_user_from_request),
    course_id: int = Path(),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.get_group_list_by_course(current_user, course_id)


@group_router.get('/get_followed')
async def get_user_groups(
    current_user: UserOut = Depends(get_user_from_request),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.get_user_groups_by_user(current_user)


@group_router.put('/{group_id}/follow')
async def follow_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Path(),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.follow_group(current_user, group_id)


@group_router.put('/{group_id}/unfollow')
async def unfollow_group(
    current_user: UserOut = Depends(get_user_from_request),
    group_id: int = Path(),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.unfollow_group(current_user, group_id)


@group_router.delete('/{user_group_id}/clear')
async def clear_progress(
    current_user = Depends(get_user_from_request),
    user_group_id = Path(),
    progress_service: ProgressService = Depends(get_progress_service)
):
    return progress_service.clear_user_group_progress(current_user, user_group_id)