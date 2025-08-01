from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import database, Course, UserCourse, UserTopic, Topic
from shemas import UserOut


@database.atomic()
def get_followed_courses(user: UserOut):
    followed_courses = UserCourse\
        .select(UserCourse, Course)\
        .join(Course, on=(UserCourse.course == Course.id))\
        .where(UserCourse.user == user.username, UserCourse.is_active == True)

    return JSONResponse([{**uc.__data__, "course": uc.course.__data__} for uc in followed_courses])

@database.atomic()
def follow_course(user: UserOut, course_id: str):
    current_course: Course = Course.get_or_none(Course.id == course_id)

    if not current_course or not current_course.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    [user_course, is_created] = UserCourse.get_or_create(
        user = user.username,
        course = current_course,
    )

    if not is_created:
        if user_course.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="course already followed"
            )
        else: 
            if not user_course.is_active:
                user_course.is_active = True
                user_course.save()

                return JSONResponse(user_course.__data__)
    
    topics: list[Topic] = Topic.select().where(Topic.by_course == current_course, Topic.is_active == True).order_by(Topic.number_in_course)

    for index, topic in enumerate(topics):
        UserTopic.create(
            topic = topic,
            user = user.username,
            by_user_course = user_course,
            ready_to_pass = False if index != 0 else True
        )
        

    return JSONResponse(user_course.__data__)


@database.atomic()
def unfollow_course(user: UserOut, course_id: str):
    current_course: Course = Course.get_or_none(Course.id == course_id)

    if not current_course or not current_course.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    user_course = UserCourse.get_or_none(UserCourse.user == user.username, UserCourse.course == current_course, UserCourse.is_active)
    if not user_course:
        raise HTTPException(400, 'you not followed')

    user_course.is_active = False
    user_course.save()

    return JSONResponse(
        {"deleted_user_course": user_course.__data__}
    )


@database.atomic()
def get_course_by_id(user: UserOut, courseId: int):
    current_course = Course.get_or_none(Course.id == courseId)
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    followed_course = UserCourse.get_or_none(UserCourse.user == user.username, UserCourse.course == current_course, UserCourse.is_active)
    return JSONResponse({'course_data': current_course.__data__, 'isFollowed': True if followed_course else False, })