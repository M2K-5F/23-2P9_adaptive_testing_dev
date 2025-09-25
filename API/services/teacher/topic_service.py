import random
from typing import List, Union
from fastapi import HTTPException
from repositories.course.course_repository import CourseRepository
from repositories.group.user_group import UserGroupRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from models import Answer, Question, Topic, UserQuestion, database, UserTopic
from shemas import SubmitChoiceQuestionUnit, SubmitTextQuestionUnit, TopicToCreate, UserOut
from fastapi.responses import JSONResponse
from fastapi import status


SubmitQuestion = Union[SubmitChoiceQuestionUnit, SubmitTextQuestionUnit]


class TopicService:
    """Service for processing actions with topics from teacher"""
    
    def __init__(
        self,
        user_group: UserGroupRepository,
        course_repo: CourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository
    ):
        self._course_repo = course_repo
        self._user_group = user_group
        self._topic_repo = topic_repository
        self._user_topic_repo = user_topic_repository

    
    @database.atomic()
    def create_topic(
        self, 
        user: UserOut,
        topic_data: TopicToCreate
    ):
        """Create a new topic in specified course and initialize user topics

        Args:
            user (UserOut): current user (teacher)
            ...

        Raises:
            HTTPException(400): if topic with same title and description already exists

        Returns:
            JSONResponse: created topic instance
        """
        current_course = self._course_repo.get_by_id(topic_data.course_id, True)

        topics_by_course = self._topic_repo.get_active_topics_by_course(current_course)
        count_topics = len(topics_by_course)

        created_topic, is_created = self._topic_repo.get_or_create(
            False, {},
            by_course = current_course,
            created_by = user.username,
            title = topic_data.title,
            description = topic_data.description,
            number_in_course = count_topics,
            score_for_pass = topic_data.score_for_pass
        )
        if not is_created:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Topic with this title and description already created"
            )

        # user_courses = self._user_course_repo.get_user_courses_by_course(current_course)

        user_groups = self._user_group.select_where(course = current_course)

        
        for user_group in user_groups:
            is_ready = False
            prev = self._user_topic_repo.get_prev_user_topic(user_group, created_topic)
            if not prev:
                is_ready = True
            else:
                is_ready = bool(prev.is_completed)

            self._user_topic_repo.create_user_topic(
                created_topic, 
                user, 
                user_group, 
                is_ready
            )

        current_course = self._course_repo.update(
            current_course,
            topic_count = current_course.topic_count + 1
        )

        
        self._user_group.update_user_groups_progress(current_course)

        return JSONResponse(created_topic.dump)


    @database.atomic()
    def arch_topic(self, user: UserOut, topic_id: str):
        """Archive a topic and disable associated user topics

        Args:
            user (UserOut): current user (teacher)
            topic_id (str): ID of the topic to archive

        Raises:
            HTTPException(400): if topic is already archived

        Returns:
            JSONResponse: archived topic instance
        """   
        current_topic = self._topic_repo.get_or_none(True,
            created_by = user.username,
            id = topic_id
        )
        if not current_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Topic already archivated"
            )
        
        current_topic = self._topic_repo.update(
            current_topic,
            is_active = False
        )

        self._user_topic_repo.disable_activeness_by_topic(current_topic)

        return JSONResponse(current_topic.dump)
    

    @database.atomic()
    def unarch_topic(self, user: UserOut, topic_id: str):
        """Unarchive a topic and enable associated user topics

        Args:
            user (UserOut): current user (teacher)
            topic_id (str): ID of the topic to unarchive

        Raises:
            HTTPException(400): if topic is already active

        Returns:
            JSONResponse: unarchived topic instance
        """   
        current_topic = self._topic_repo.get_or_none(True,
            created_by = user.username,
            id = topic_id
        )
        if current_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Topic already active"
            )
        
        current_topic = self._topic_repo.update(
            current_topic,
            is_active = True
        )

        self._user_topic_repo.enable_activeness_by_topic(current_topic)

        return JSONResponse(current_topic.dump)