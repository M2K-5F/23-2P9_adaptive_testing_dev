from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import database, Course, Topic
from shemas import  UserOut



@database.atomic()
def create_topic(user: UserOut, title: str, description: str, course_id: str):
    current_course = Course.get_or_none(Course.id == course_id)
    
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="course not found"
        )

    topics_by_course = Topic.select().where(Topic.by_course == current_course)
    count_topics = len(topics_by_course)
    if not count_topics:
        topic = Topic.create(
            by_course = current_course,
            created_by = user.username,
            title = title,
            description = description,
            number_in_course = 0
        )

        return JSONResponse(topic.__data__)

    current_topic, is_created = Topic.get_or_create(
        by_course = current_course,
        created_by = user.username,
        title = title,
        description = description,
        number_in_course = count_topics
    )
    if not is_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this title and description already created"
        )
    
    return JSONResponse(current_topic.__data__)


@database.atomic()
def change_activity_of_topic(user: UserOut, topic_id: str):   
    current_topic = Topic.get_or_none(
        Topic.id == topic_id,
        Topic.created_by == user.username   
    )
    current_topic.is_active = not current_topic.is_active
    current_topic.save()
    return JSONResponse(current_topic.__data__)