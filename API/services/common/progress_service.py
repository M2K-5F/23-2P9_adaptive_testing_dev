from typing import Dict

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from dependencies import user
from models import UserGroup, UserQuestion
import models
from repositories import (
    UserTopicRepository,
    UserTopic, 
    UserQuestionRepository,
    TopicRepository,
    UserTextAnswerRepository
)
from repositories.group import user_group
from repositories.group.user_group import UserGroupRepository
from shemas import UserOut


class ProgressService:
    """Service for managing accessibility and progress tracking of topics, courses and questions."""
    def __init__(
        self, 
        user_group: UserGroupRepository,
        user_topic_repo: UserTopicRepository,
        user_question_repo: UserQuestionRepository,
        topic_repo: TopicRepository,
        text_answer_repo: UserTextAnswerRepository
    ):  
        self._user_topic_repo = user_topic_repo
        self._user_group = user_group
        self._topic_repo = topic_repo
        self._user_question_repo = user_question_repo
        self._user_text_answer_repo = text_answer_repo


    @models.database.atomic()
    def clear_user_group_progress(self, user: UserOut, user_group_id: int) -> JSONResponse:
        """
        Clears all progress for a user course and associated topics.
        
        Args:
            user (UserOut): Current user
            user_course_id (int): User course identifier to clear
            with_delete (bool, optional): Whether to delete topic instances. Defaults to False.
            
        Returns:
            UserCourse: The cleared user course instance
        """

        user_group = self._user_group.get_or_none(
            True,
            user = user.username,
            id = user_group_id
        )

        user_topics = self._user_topic_repo.get_user_topics_by_user_group(user_group)

        for user_topic in user_topics:
            self._user_question_repo.delete_all(by_user_topic=user_topic)

            self._user_text_answer_repo.delete_all(by_user_topic = user_topic)

            self._user_topic_repo.clear_user_topic_progress(user_topic)
        
        user_group = self._user_group.clear_user_group_progress(user_group)
        
        return JSONResponse(user_group.dump)


    def validate_topic_access(self, user_topic: UserTopic):
        """
        Validates if a user topic is accessible for passing.
        
        Args:
            user_topic (UserTopic): user topic 
            
        Raises:
            HTTPException(400): if topic is inactive or not ready to pass
        """

        if not user_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "This user_topic are inactive"
            )

        if not user_topic.is_available:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "u cannot pass this topic"
            )


    def update_user_topic_score(self, user_topic: UserTopic, topic_score: float):
        """
        Updates user topic score and handles completion logic.
        
        Args:
            user_topic (UserTopic): User topic to update
            topic_score (float): New score value (0.0 to 1.0)
            
        Returns:
            float: The updated topic score
        """

        self._user_topic_repo.update(
            user_topic,
            is_attempted = True,
            attempt_count = user_topic.attempt_count + 1
        )

        if user_topic.progress < topic_score:  # pyright: ignore
            user_topic = self._user_topic_repo.update(
                user_topic, 
                progress = round(topic_score, 3)
            )
            

        if user_topic.progress >= user_topic.topic.score_for_pass and not user_topic.is_completed:  # pyright: ignore
            user_topic = self._user_topic_repo.update(
                user_topic, 
                is_completed = True
            )

            user_group: UserGroup = user_topic.by_user_group  # pyright: ignore
            user_group = self._user_group.update(
                user_group,
                completed_topic_count = user_group.completed_topic_count + 1,
                progress = (
                    (user_group.completed_topic_count + 1) / 
                    len(self._topic_repo.get_active_topics_by_course(user_group.course))  # pyright: ignore
                )
            )

            next_user_topic = self._user_topic_repo.get_next_user_topic(user_topic)

            if next_user_topic:
                next_user_topic = self._user_topic_repo.update(
                    next_user_topic, 
                    is_available = True
                )

        return topic_score


    def delete_user_group_associations(self, user_group: UserGroup):
        user_topics = self._user_topic_repo.get_user_topics_by_user_group(user_group)

        for user_topic in user_topics:
            self._user_question_repo.delete_all(by_user_topic=user_topic)

            self._user_text_answer_repo.delete_all(by_user_topic = user_topic)
            user_topic.delete_instance()
        
        user_group.delete_instance()

        return user_group
    

    def update_user_progress(self, user_topic: UserTopic):
        """
        Recalculates and updates topic progress based on question scores.
        
        Args:
            user_topic (UserTopic): User topic to update
            
        Returns:
            UserTopic: Updated user topic instance
        """

        user_questions_by_topic = self._user_question_repo.get_by_user_topic(user_topic)
        topic_score: float = 0 

        for q in user_questions_by_topic:
            topic_score += (
                q.progress /  # pyright: ignore
                len(user_questions_by_topic)
            )

        topic_score = max(topic_score, user_topic.progress) #pyright: ignore
        
        if topic_score >= user_topic.topic.score_for_pass and not user_topic.is_completed:
            user_topic = self._user_topic_repo.update_by_instance(user_topic, {
                'is_completed': True
            })
            
            next_ut = self._user_topic_repo.get_next_user_topic(user_topic)
            if next_ut:
                next_ut = self._user_topic_repo.update(
                    next_ut,
                    is_available = True
                )

        user_topic = self._user_topic_repo.update(
            user_topic, 
            progress = topic_score
        )

        user_group: UserGroup = user_topic.by_user_group # pyright: ignore
        user_topics_by_group  = self._user_topic_repo.get_user_topics_by_user_group(user_group)

        completed_topic_count = len(list(filter(lambda t: t.is_completed, user_topics_by_group)))
        group_progress = completed_topic_count / len(user_topics_by_group)
        
        user_group = self._user_group.update(
            user_group,
            progress = group_progress,
            completed_topic_count = completed_topic_count
        )

        return user_topic