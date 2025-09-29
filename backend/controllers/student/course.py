from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import JSONResponse
from services.common.progress_service import ProgressService
from services.student.course_service import CourseService
from dependencies.dependencies import get_progress_service, get_student_course_service

from dependencies.user import get_user_from_request
from shemas import UserOut

course_router = APIRouter(prefix='/course', tags=["Student/Course"])


@course_router.get('/get_by_id', summary="Get course, is_followed by course_id")
async def get_course(
    course_id = Query(),
    current_user = Depends(get_user_from_request),
    course_service: CourseService = Depends(get_student_course_service)
) -> JSONResponse:
    return course_service.get_course_by_id(user=current_user, course_id=course_id)
