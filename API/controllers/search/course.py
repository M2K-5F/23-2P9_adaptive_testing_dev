from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from dependencies.user import get_user_from_request
from dependencies.dependencies import get_student_course_service, SCS
from shemas import UserOut, Roles


search_router = APIRouter(prefix='/search', tags=["Search"])

@search_router.get('/course')
async def search_courses(
    current_user: UserOut = Depends(get_user_from_request),
    course_service: SCS = Depends(get_student_course_service),
    q: str = Query()
) -> JSONResponse:
    return course_service.search_courses(current_user, q)