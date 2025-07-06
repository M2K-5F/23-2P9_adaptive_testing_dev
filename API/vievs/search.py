from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from .depends import get_current_active_user
from shemas import UserOut, Roles
from crud import search_courses as course_search


search_router = APIRouter(prefix='/search', tags=["Search"])

@search_router.get('/course')
async def search_courses(
    current_user: UserOut = Depends(get_current_active_user),
    q: str = Query()
) -> JSONResponse:
    return course_search(current_user, q)
    