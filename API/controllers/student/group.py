from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import JSONResponse
from pydantic import Json
from services.student.group import GroupService
from dependencies.dependencies import get_student_group_service

from dependencies.user import get_user_from_request
from shemas import UserOut

group_router = APIRouter(prefix='/group', tags=["Student/group"])


@group_router.get('/get')
def get_group_list(
    current_user: UserOut = Depends(get_user_from_request),
    course_id: int = Query(),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.get_group_list_by_course(current_user, course_id)


@group_router.get('/get_user_groups')
async def get_user_groups(
    current_user: UserOut = Depends(get_user_from_request),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.get_user_groups_by_user(current_user)


@group_router.put('/follow')
async def follow_group(
    current_user = Depends(get_user_from_request),
    group_id: int = Query(),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.follow_group(current_user, group_id)


@group_router.put('/unfollow')
async def unfollow_group(
    current_user: UserOut = Depends(get_user_from_request),
    group_id: int = Query(),
    service: GroupService = Depends(get_student_group_service)
) -> JSONResponse:
    return service.unfollow_group(current_user, group_id)