import random
from typing import List, Union
from fastapi import HTTPException
from repositories.course.course_repository import CourseRepository
from repositories.group.group import GroupRepository
from repositories.question.question_weigth import QuestionWeigthRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.user_question_repository import UserQuestionRepository
from repositories.question.adaptive_question_repository import AdaptiveQuestionRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from repositories.answer.answer_repository import AnswerRepository
from repositories.question.question_repository import QuestionRepository
from models import Answer, Question, Topic, UserQuestion, database, UserTopic
from services.common.progress_service import ProgressService
from shemas import QuestionBase, SubmitChoiceQuestionUnit, SubmitTextQuestionUnit, UserOut, TopicSubmitAnswers
from fastapi.responses import JSONResponse
from fastapi import status


SubmitQuestion = Union[SubmitChoiceQuestionUnit, SubmitTextQuestionUnit]


class QuestionService:
    """Service for processing actions with questions from teacher"""
    
    def __init__(
        self,
        topic_repository: TopicRepository,
        question_weigth: QuestionWeigthRepository,
        user_question_repository: UserQuestionRepository,
        user_text_answer_repo: UserTextAnswerRepository,
        answer_repo: AnswerRepository,
        question_repo: QuestionRepository,
        progress_service: ProgressService,
        group: GroupRepository
    ):
        self._topic_repo = topic_repository
        self._group = group
        self._question_weigth = question_weigth
        self._user_question_repo = user_question_repository
        self._user_text_answer_repo = user_text_answer_repo
        self._answer_repo = answer_repo
        self._question_repo = question_repo
        self._progress_service = progress_service

    
    @database.atomic()
    def create_question(self, user: UserOut, topic_id: int, question_to_create: QuestionBase):
        """Create a new question in specified topic

        Args:
            user (UserOut): current user (teacher)
            topic_id (int): ID of the topic where question will be created
            question_to_create (QuestionBase): question data including text and answer options

        Raises:
            HTTPException(400): if no correct answer options provided for choice questions

        Returns:
            JSONResponse: created question instance with answers
        """
        current_topic = self._topic_repo.get_by_id(topic_id, True)

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


        created_question = self._question_repo.get_or_create(
            True, 
            {
                "question_type": question_type
            },
            text = question_to_create.text,
            by_topic = current_topic
        )

        for answer_option in question_to_create.answer_options:

            self._answer_repo.get_or_create(True, {},
                text = answer_option.text,
                is_correct = True if question_to_create.question_type == "text" else answer_option.is_correct,
                by_question = created_question
            )
        current_topic = self._topic_repo.update(
            current_topic, 
            question_count = current_topic.question_count + 1
        )
        groups_by_course = self._group.select_where(by_course = current_topic.by_course)
        for group in groups_by_course:
            self._question_weigth.get_or_create(
                True,
                {},
                group = group,
                question = created_question
            )
        return JSONResponse(created_question.dump)


    @database.atomic()
    def arch_question(self, user: UserOut, question_id: int ):
        """Archive a question and decrease topic question count

        Args:
            user (UserOut): current user (teacher)
            question_id (int): ID of the question to archive

        Raises:
            HTTPException(400): if question wasn't created by user or already archived

        Returns:
            JSONResponse: archived question instance
        """
        current_question = self._question_repo.get_by_id(question_id, True)

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
        current_question = self._question_repo.update_by_instance(current_question, {'is_active': False})

        
        by_topic: Topic = current_question.by_topic  # pyright: ignore
        by_topic = self._topic_repo.update_by_instance(by_topic, {'question_count': by_topic.question_count - 1})

        return JSONResponse(current_question.dump)


    @database.atomic()
    def unarch_question(self, user: UserOut, question_id: int):
        """Unarchive a question and increase topic question count

        Args:
            user (UserOut): current user (teacher)
            question_id (int): ID of the question to unarchive

        Raises:
            HTTPException(400): if question wasn't created by user or already active

        Returns:
            JSONResponse: unarchived question instance
        """
        current_question = self._question_repo.get_by_id(question_id, True)

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

        current_question = self._question_repo.update_by_instance(current_question, {'is_active': True})

        
        by_topic: Topic = current_question.by_topic  # pyright: ignore
        by_topic = self._topic_repo.update_by_instance(by_topic, {'question_count': by_topic.question_count + 1})

        return JSONResponse(current_question.dump)


    @database.atomic()
    def get_question_list(self, user: UserOut, topic_id: int):
        """Get list of all questions in a topic created by the user

        Args:
            user (UserOut): current user (teacher)
            topic_id (int): ID of the topic to get questions from

        Returns:
            JSONResponse: list of questions with their answer options
        """
        current_topic = self._topic_repo.get_or_none(True, 
            id = topic_id, 
            created_by = user.username
        )

        questions_by_topic = self._question_repo.select_where(by_topic = current_topic)
        
        to_return = []
        for question in questions_by_topic:
            answers_by_question = self._answer_repo.select_where(by_question = question)

            to_return.append({**question.dump, "answer_options": [answer.dump for answer in answers_by_question]})

        return JSONResponse(to_return)

    
    def submit_question(self, user: UserOut, score: float, user_answer_id: int):
        """Submit and evaluate a text question answer (teacher grading)

        Args:
            user (UserOut): current user (teacher)
            score (float): score assigned to the answer (0-100)
            user_answer_id (int): ID of the user's text answer to evaluate

        Raises:
            HTTPException(400): if question wasn't created by the user

        Returns:
            JSONResponse: updated user topic progress information
        """
        user_answer = self._user_text_answer_repo.get_or_none(True,
            id = user_answer_id,
            is_active = True
        )

        if user_answer.by_user_topic.topic.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Question wasn`t created by you"
            )

        user_answer = self._user_text_answer_repo.update(user_answer, 
            is_correct = (score != 0),
            is_active = False
        )

        user_question: UserQuestion = user_answer.for_user_question  # pyright: ignore
        user_question = self._user_question_repo.update(user_question, 
            question_score = score
        )

        user_topic: UserTopic = user_question.by_user_topic  # pyright: ignore
        user_topic = self._progress_service.update_user_topic_progress(user_topic)
        
        return JSONResponse(user_topic.dump)