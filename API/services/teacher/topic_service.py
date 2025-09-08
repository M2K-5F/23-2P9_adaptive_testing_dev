import random
from typing import List, Union
from fastapi import HTTPException
from repositories.course.course_repository import CourseRepository
from repositories.course.user_course_repository import UserCourseRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.user_question_repository import UserQuestionRepository
from repositories.question.adaptive_question_repository import AdaptiveQuestionRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from repositories.answer.answer_repository import AnswerRepository
from repositories.question.question_repository import QuestionRepository
from db import Answer, Question, Topic, UserCourse, UserQuestion, database, UserTopic
from shemas import SubmitChoiceQuestionUnit, SubmitTextQuestionUnit, UserOut, TopicSubmitAnswers
from fastapi.responses import JSONResponse
from fastapi import status


SubmitQuestion = Union[SubmitChoiceQuestionUnit, SubmitTextQuestionUnit]


class TopicService:
    def __init__(
        self,
        course_repo: CourseRepository,
        user_course_repo: UserCourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_question_repository: UserQuestionRepository,
        adaptive_question_repo: AdaptiveQuestionRepository,
        user_text_answer_repo: UserTextAnswerRepository,
        answer_repo: AnswerRepository,
        question_repo: QuestionRepository
    ):
        self.course_repo = course_repo
        self.topic_repo = topic_repository
        self.user_course_repo = user_course_repo
        self.user_topic_repo = user_topic_repository
        self.user_question_repo = user_question_repository
        self.adaptive_question_repo = adaptive_question_repo
        self.user_text_answer_repo = user_text_answer_repo
        self.answer_repo = answer_repo
        self.question_repo = question_repo

    
    @database.atomic()
    def create_topic(self, user: UserOut, title: str, description:str, course_id: int):
        current_course = self.course_repo.get_by_id(course_id, True)

        topics_by_course = self.topic_repo.get_active_topics_by_course(current_course)
        count_topics = len(topics_by_course)

        created_topic, is_created = self.topic_repo.get_or_create(
            False, {},
            by_course = current_course,
            created_by = user.username,
            title = title,
            description = description,
            number_in_course = count_topics
        )
        if not is_created:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Topic with this title and description already created"
            )

        user_courses = self.user_course_repo.get_user_courses_by_course(current_course)
        
        for user_course in user_courses:
            is_ready = False
            prev = self.user_topic_repo.get_prev_user_topic(user_course, created_topic)
            if not prev:
                is_ready = True
            else:
                is_ready = bool(prev.is_completed)

            self.user_topic_repo.create_user_topic(
                created_topic, user.username, user_course, is_ready
            )

        current_course.topic_count += 1
        current_course.save()
        return JSONResponse(created_topic.dump)


    @database.atomic()
    def arch_topic(self, user: UserOut, topic_id: str):   
        current_topic = self.topic_repo.get_or_none(True,
            created_by = user.username,
            id = topic_id
        )
        if not current_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Topic already archivated"
            )
        
        current_topic.is_active = False
        current_topic.save()
        return JSONResponse(current_topic.dump)
    

    @database.atomic()
    def unarch_topic(self, user: UserOut, topic_id: str):   
        current_topic = self.topic_repo.get_or_none(True,
            created_by = user.username,
            id = topic_id
        )
        if current_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Topic already active"
            )
        
        current_topic.is_active = True
        current_topic.save()
        return JSONResponse(current_topic.dump)
