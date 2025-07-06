from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.responses import JSONResponse

from .depends import get_current_active_user
from crud import compare_role, get_courses_list, get_followed_courses, change_activity_of_course, follow_course, course_create
from shemas import UserOut, Roles

course_router = APIRouter(prefix='/course', tags=["Courses"])


@course_router.post('/create')
async def create_course(
    current_user: UserOut = Depends(get_current_active_user),
    course_title = Query(default="course")
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )

    return course_create(course_title, user=current_user)


@course_router.get('/get')
async def get_teacher_courses(
    current_user = Depends(get_current_active_user)
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )
    
    return get_courses_list(current_user)


@course_router.get('/get_followed')
async def get_followed_teacher_courses(
    current_user = Depends(get_current_active_user)
) -> JSONResponse:
    return get_followed_courses(current_user)


@course_router.put('/arch')
async def arch_course(
    course_id = Query(default="course"),
    current_user: UserOut = Depends(get_current_active_user)
) -> JSONResponse:
    if compare_role(current_user.username, Roles.STUDENT):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create polls"
        )

    return change_activity_of_course(course_id=course_id, user=current_user)

    
@course_router.post("/follow")
def follow_teacher_course(
    current_user: UserOut = Depends(get_current_active_user),
    course_id = Query()
) -> JSONResponse:
    return follow_course(current_user, course_id)


@course_router.delete('/unfollow')
def unfollow_teacher_course(
    current_user: UserOut = Depends(get_current_active_user),
    course_id = Query()
) -> JSONResponse:
    return follow_course(current_user, course_id, True)
