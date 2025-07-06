"""python interaction with database"""
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from typing import Union, Tuple
from peewee import fn

from db import (database, User, UserRole, Role, 
    Course, Answer, Question,
    Topic, UserCourse, UserQuestion, UserTopic
)
from app_utils import get_password_hash
from shemas import UserCreate, Roles, UserOut, QuestionBase, AnswerOptionBase

def sqlite_lower(value):
    return value.lower()

database.register_function(lambda x: x.lower(), 'lower')


@database.atomic()
def create_user(user: UserCreate):
    try:
        currect_user = User.create(
            username=user.username,
            name=user.name,
            telegram_link=user.telegram_link,
            password_hash=get_password_hash(user.password)
        )

        UserRole.create(
            user = currect_user,
            role = Role.get_or_none(Role.status == user.role)
        )

    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already registered"
        )

    return "Username registered"


@database.atomic()
def compare_role(username, role: Roles):
    user_role: UserRole = UserRole.get_or_none(UserRole.user == User.get_or_none(User.username == username))

    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='user not found'
        )
    print(user_role.role.status, role)
    if user_role.role.status == role:
        return True
    
    return False


@database.atomic()
def find_user(username) :
    current_user = User.get_or_none(User.username == username)
    if not current_user:
        raise HTTPException(
            detail='user not finded',
            status_code=status.HTTP_401_UNAUTHORIZED
        )
        
    user_role = (UserRole.get_or_none(UserRole.user == current_user)).role.status
    return UserOut(
        username=current_user.username,
        name=current_user.name,
        telegram_link=current_user.telegram_link,
        role=user_role
    )


@database.atomic()
def find_password(username):
    current_user = User.get_or_none(User.username == username)

    if current_user:
        return current_user.password_hash
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="user not finded"
    )


@database.atomic()
def course_create(course_title, user: UserOut):

    if Course.get_or_none(
        Course.title == course_title, 
        Course.created_by == User.get_or_none(
            User.username == user.username
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course already created"
        )
    try:
        data: Course = Course.create(
            title = course_title,
            created_by = user.username,
        )

    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some exc"
        )

    return JSONResponse(
        content={
            "title": data.title,
        }
    )


@database.atomic()
def change_activity_of_course(course_id: str, user: UserOut):
    current_course = Course.get_or_none(Course.id == course_id)
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    try:
        current_course.is_active = not current_course.is_active
        current_course.save()
        return current_course.__data__        
    
    except: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )


@database.atomic()
def get_courses_list(user: UserOut):
    try:
        courses = Course.select().where(Course.created_by == User.get_or_none(User.username == user.username))
        to_return = []
        for course in courses:
            to_return.append(course.__data__)

        return JSONResponse(content=to_return)

    except: 
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST
        )


@database.atomic()
def get_followed_courses(user: UserOut):
    followed_courses = UserCourse\
                        .select(UserCourse, Course)\
                        .join(Course, on=(UserCourse.course == Course.id))\
                        .where(UserCourse.user == user.username)

    return JSONResponse([{**uc.__data__, "course": uc.course.__data__} for uc in followed_courses])

@database.atomic()
def follow_course(user: UserOut, course_id: str, unfollow: bool = False):
    current_course: Course = Course.get_or_none(Course.id == course_id)
    if not current_course or not current_course.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    user_course, is_created = UserCourse.get_or_create(
        user = user.username,
        course = current_course,
    )

    if is_created and unfollow:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "course are not follow"
        )

    if not is_created and not unfollow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="course already followed"
        )

    if not is_created and unfollow:
        user_course.delete_instance()

        return JSONResponse(
            {"deleted_user_course": user_course.__data__}
        )
    
    return JSONResponse(user_course.__data__)
    

@database.atomic()
def create_topic(user: UserOut, title: str, description: str, course_id: str):
    current_course = Course.get_or_none(Course.id == course_id)
    if not current_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="course not found"
        )

    current_topic, is_created = Topic.get_or_create(
        by_course = current_course,
        created_by = user.username,
        title = title,
        description = description,
    )
    if not is_created:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic with this title and description already created"
        )
    
    return JSONResponse(current_topic.__data__)



@database.atomic()
def get_teacher_topics_by_course(user: UserOut, course_id: str):
    topics = Topic.select().where(Topic.created_by == user.username, Topic.by_course == course_id)
    if not topics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND
        )

    to_return = []
    for topic in topics:
        to_return.append(topic.__data__)

    return JSONResponse(to_return)


@database.atomic()
def get_followed_topics(user: UserOut, course_id):
    followed_topics = UserTopic.select().join(Topic).where(
        UserTopic.user == user.username,
        UserTopic.topic.by_course == course_id
    )

    return JSONResponse([topic.__data__ for topic in followed_topics])


@database.atomic()
def change_activity_of_topic(user: UserOut, topic_id: str):   
    current_topic = Topic.get_or_none(
        Topic.id == topic_id,
        Topic.created_by == user.username
    )
    current_topic.is_active = not current_topic.is_active
    current_topic.save()
    return JSONResponse(current_topic.__data__)


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


@database.atomic()
def create_question(user: UserOut, topic_id: str, question: QuestionBase ):
    current_topic = Topic.get_or_none(
        Topic.id == topic_id
    )
    if not current_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="topic not found"
        )
    
    created_question, is_created = Question.get_or_create(
        text = question.text,
        by_topic = current_topic,
        defaults = {"question_type" : question.question_type}
    )

    if not is_created:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "question with that title already created in topic"
        )

    for answer_option in question.answer_options:
        Answer.create(
            text = answer_option.text,
            is_correct = answer_option.is_correct,
            by_question = created_question
        )
    
    return JSONResponse(
        content=created_question.__data__
    )


@database.atomic()
def get_question_list(user: UserOut, topic_id: str):
    current_topic = Topic.get_or_none(
        Topic.id == topic_id,
        Topic.created_by == user.username
    )
    if not current_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="topic not found"
        )
    
    questions = Question.select().where(
        Question.by_topic == current_topic
    )
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="user not found"
        )
    
    to_return = []
    for question in questions:
        db_answers = Answer.select().where(
            Answer.by_question == question
        )
        answers = []
        for answer in db_answers:
            answers.append(answer.__data__)

        to_return.append({**question.__data__, "answer_options": answers})

    return JSONResponse(
        content=to_return
    )


@database.atomic()
def arch_question(user: UserOut, question_id: str ):
    current_question = Question.get_or_none(
        Question.id == question_id
    )

    current_question.is_active = not current_question.is_active
    current_question.save()
    
    return JSONResponse(current_question.__data__)


@database.atomic()
def search_courses(user: UserOut, search_query: str):
    
    searched_courses = Course.select().where(
        fn.lower(Course.title).contains(search_query.lower()),
        Course.created_by != user.username
    )
    return JSONResponse([course.__data__ for course in searched_courses])