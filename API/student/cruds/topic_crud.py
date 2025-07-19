from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import (database, User, UserRole, Role, 
    Course, Answer, Question,
    Topic, UserCourse, UserQuestion, UserTopic
)
from shemas import UserCreate, Roles, UserOut, QuestionBase, AnswerOptionBase


 
@database.atomic()
def get_teacher_topics_by_course(user: UserOut, course_id: str):
    topics = Topic.select().where(Topic.by_course == course_id)

    to_return = []
    for topic in topics:
        count = len(topic.created_questions)
        to_return.append({**topic.__data__, "count": count})
    
    return JSONResponse(to_return)
    

@database.atomic()
def get_followed_topics(user: UserOut, course_id):
    followed_topics = UserTopic.select().join(Topic).where(
        UserTopic.user == user.username,
        UserTopic.topic.by_course == course_id
    )

    return JSONResponse([topic.__data__ for topic in followed_topics])





@database.atomic()
def follow_topic(user: UserOut, topic_id, unfollow: bool = False):
    try:
        current_topic: Topic = Topic.get_by_id(topic_id)
        if not current_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "topic inactive"
            )
    
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )


    if not UserCourse.select().where(
        UserCourse.user == user.username,
        UserCourse.course == current_topic.by_course
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="cant follow topic by unfollow course"
        )

    user_topic, is_created = UserTopic.get_or_create(
        user = user.username,
        topic = current_topic
    )

    if not is_created and unfollow:
        user_topic.delete_instance()

        return JSONResponse(
            content={
                "deleted_user_topic": user_topic.__data__
            }
        )

    if is_created and unfollow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="topic already unfollowed"
        )

    if not is_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="topic already followed"
        )
    
    return user_topic.__data__