from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from api_depends import get_user_from_request, get_current_active_user
from shemas import UserOut, Roles
from ..cruds import search_courses as course_search


search_router = APIRouter(prefix='/search', tags=["Search"], dependencies=[Depends(get_current_active_user)])

@search_router.get('/course')
async def search_courses(
    current_user: UserOut = Depends(get_user_from_request),
    q: str = Query()
) -> JSONResponse:
    return course_search(current_user, q)