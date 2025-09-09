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
from shemas import QuestionBase, SubmitChoiceQuestionUnit, SubmitTextQuestionUnit, UserOut, TopicSubmitAnswers
from fastapi.responses import JSONResponse
from fastapi import status


SubmitQuestion = Union[SubmitChoiceQuestionUnit, SubmitTextQuestionUnit]


class QuestionService:
    def __init__(
        self,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_question_repository: UserQuestionRepository,
        user_text_answer_repo: UserTextAnswerRepository,
        answer_repo: AnswerRepository,
        question_repo: QuestionRepository
    ):
        self.topic_repo = topic_repository
        self.user_topic_repo = user_topic_repository
        self.user_question_repo = user_question_repository
        self.user_text_answer_repo = user_text_answer_repo
        self.answer_repo = answer_repo
        self.question_repo = question_repo

    
    @database.atomic()
    def create_question(self, user: UserOut, topic_id: int, question_to_create: QuestionBase):
        current_topic = self.topic_repo.get_by_id(topic_id, True)

        question_type = question_to_create.question_type

        if question_type != 'text':
            correct_answers_count = len(list(filter(lambda q: q.is_correct, question_to_create.answer_options )))
            if correct_answers_count > 1:
                question_type = 'multiple'

            elif correct_answers_count == 1:
                question_type = 'single'

            else:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "no corrected options"
                )


        created_question = self.question_repo.get_or_create(
            True, {"question_type": question_type},
            text = question_to_create.text,
            by_topic = current_topic
        )

        for answer_option in question_to_create.answer_options:

            self.answer_repo.get_or_create(True, {},
                text = answer_option.text,
                is_correct = True if question_to_create.question_type == "text" else answer_option.is_correct,
                by_question = created_question
            )
        current_topic = self.topic_repo.update_by_instance(current_topic, {'question_count': current_topic.question_count + 1})
        return JSONResponse(created_question.dump)


    @database.atomic()
    def arch_question(self, user: UserOut, question_id: int ):
        current_question = self.question_repo.get_by_id(question_id, True)

        if current_question.by_topic.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Question wasn`t created by you"
            )
            
        if not current_question.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Already archivated"
            )
        current_question = self.question_repo.update_by_instance(current_question, {'is_active': False})

        
        by_topic: Topic = current_question.by_topic  # pyright: ignore
        by_topic = self.topic_repo.update_by_instance(by_topic, {'question_count': by_topic.question_count - 1})

        return JSONResponse(current_question.dump)


    @database.atomic()
    def unarch_question(self, user: UserOut, question_id: int):
        current_question = self.question_repo.get_by_id(question_id, True)

        if current_question.by_topic.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Question wasn`t created by you"
            )

        if current_question.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Already active"
            )

        current_question = self.question_repo.update_by_instance(current_question, {'is_active': True})

        
        by_topic: Topic = current_question.by_topic  # pyright: ignore
        by_topic = self.topic_repo.update_by_instance(by_topic, {'question_count': by_topic.question_count + 1})

        return JSONResponse(current_question.dump)


    @database.atomic()
    def get_question_list(self, user: UserOut, topic_id: int):
        current_topic = self.topic_repo.get_or_none(True, 
            id = topic_id, 
            created_by = user.username
        )

        questions_by_topic = self.question_repo.select_where(by_topic = current_topic)
        
        to_return = []
        for question in questions_by_topic:
            answers_by_question = self.answer_repo.select_where(by_question = question)

            to_return.append({**question.dump, "answer_options": [answer.dump for answer in answers_by_question]})

        return JSONResponse(to_return)

    
    def submit_question(self, user: UserOut, score: float, user_answer_id: int):
        user_answer = self.user_text_answer_repo.get_or_none(True,
            id = user_answer_id,
            is_active = True
        )

        if user_answer.by_user_topic.topic.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Question wasn`t created by you"
            )

        user_answer = self.user_text_answer_repo.update_by_instance(user_answer, {
            'is_correct': score != 0,
            'is_active': False
        })

        user_question: UserQuestion = user_answer.for_user_question  # pyright: ignore
        user_question = self.user_question_repo.update_by_instance(user_question, {
            'question_score': score
        })

        user_topic: UserTopic = user_question.by_user_topic  # pyright: ignore
        user_topic = self.update_user_topic_progress(user_topic)
        
        return JSONResponse(user_topic.dump)


    def update_user_topic_progress(self, user_topic: UserTopic):
        user_questions_by_topic = self.user_question_repo.get_by_user_topic(user_topic)
        topic_score = 0 

        for q in user_questions_by_topic:
            topic_score += (
                q.question_score /  # pyright: ignore
                len(user_questions_by_topic)
            )

        topic_score = max(topic_score, user_topic.topic_progress)
        
        if topic_score >= 0.8:
            user_topic = self.user_topic_repo.update_by_instance(user_topic, {
                'is_completed': True
            })
            
            next_ut = self.user_topic_repo.get_next_user_topic(user_topic)
            if next_ut:
                next_ut = self.user_topic_repo.update_by_instance(next_ut, {
                    'ready_to_pass': True
                })

        user_topic = self.user_topic_repo.update_by_instance(user_topic, {
            'topic_progress': topic_score
        })

        user_course: UserCourse = user_topic.by_user_course # pyright: ignore
        user_topics_by_course  = self.user_topic_repo.get_user_topics_by_user_course(user_course)
        course_progress = 0

        for t in user_topics_by_course:
            if t.topic_progress >= 0.8: # pyright: ignore
                course_progress += 100 / len(user_topics_by_course)
                user_course.completed_topic_number += 1

        user_course.course_progress = course_progress
        user_course.save()

        return user_topic
