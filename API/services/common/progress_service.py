from typing import Dict

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from models import UserQuestion
from repositories import (
    UserCourseRepository, 
    UserTopicRepository,
    UserTopic, UserCourse,
    UserQuestionRepository,
    TopicRepository,
    AdaptiveQuestionRepository,
    UserTextAnswerRepository
)
from shemas import UserOut


class ProgressService:
    """Service for management acessibility & progresses of topic, courses and questions"""
    def __init__(
            self, 
            user_topic_repo: UserTopicRepository,
            user_course_repo: UserCourseRepository,
            user_question_repo: UserQuestionRepository,
            topic_repo: TopicRepository,
            adaptive_question_repo: AdaptiveQuestionRepository,
            text_answer_repo: UserTextAnswerRepository
    ):  
        self._user_topic_repo = user_topic_repo
        self._user_course_repo = user_course_repo
        self._topic_repo = topic_repo
        self._user_question_repo = user_question_repo
        self._adaptive_question_repo = adaptive_question_repo
        self._user_text_answer_repo = text_answer_repo


    def validate_topic_acess(self, user_topic: UserTopic):
        if not user_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "This user_topic are inactive"
            )

        if not user_topic.ready_to_pass:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "u cannot pass this topic"
            )


    def update_user_topic_score(self, user_topic: UserTopic, topic_score: float):
        if user_topic.topic_progress < topic_score:  # pyright: ignore
            user_topic = self._user_topic_repo.update(
                user_topic, 
                topic_progress = round(topic_score, 3)
            )
            

        if user_topic.topic_progress >= 0.8 and not user_topic.is_completed:  # pyright: ignore
            user_topic = self._user_topic_repo.update(user_topic, is_completed = True)

            user_course: UserCourse = user_topic.by_user_course  # pyright: ignore
            user_course = self._user_course_repo.update(
                user_course,
                completed_topic_number = user_course.completed_topic_number + 1,
                course_progress = (
                    (user_course.completed_topic_number + 1) / 
                    len(self._topic_repo.get_active_topics_by_course(user_course.course))  # pyright: ignore
                ) * 100
            )

            next_user_topic = self._user_topic_repo.get_next_user_topic(user_topic)

            if next_user_topic:
                next_user_topic = self._user_topic_repo.update(
                    next_user_topic, 
                    ready_to_pass = True
                )

        return topic_score
    

    def clear_user_course_progress(self, user: UserOut, user_course_id: int, with_delete: bool = False) -> UserCourse:
        user_course = self._user_course_repo.get_or_none(True, id = user_course_id, user = user.username)

        user_topics = self._user_topic_repo.get_user_topics_by_user_course(user_course)

        for user_topic in user_topics:
            self._user_question_repo.delete_all(by_user_topic=user_topic)
        
            self._adaptive_question_repo.delete_all(by_user_topic = user_topic)

            self._user_text_answer_repo.delete_all(by_user_topic = user_topic)

            self._user_topic_repo.clear_user_topic_progress(user_topic)

            if with_delete:
                user_topic.delete_instance()
        
        user_course = self._user_course_repo.clear_user_course_progress(user_course)

        return user_course
