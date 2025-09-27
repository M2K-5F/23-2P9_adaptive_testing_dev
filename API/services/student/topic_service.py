from datetime import datetime
import random
from typing import List, Tuple
from fastapi import HTTPException
from repositories.attempt.question import QuestionAttemptRepository
from repositories.attempt.topic import TopicAttemptRepository
from repositories.course.course_repository import CourseRepository
from repositories.group.user_group import UserGroupRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.question_repository import QuestionRepository
from models import Answer, Question, QuestionAttempt, QuestionWeight, Topic, database
from services.common.progress_service import ProgressService
from services.common.adaptivity_service import AdaptivityServise
from shemas import UserOut, TopicSubmitAnswers
from fastapi.responses import JSONResponse
from fastapi import status
from utils.score_utils import get_question_score


class TopicService:
    """Service for processing action with topics from student"""

    def __init__(
        self,
        course_repo: CourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        question_repo: QuestionRepository,
        progress_service: ProgressService,
        adaptivity_service: AdaptivityServise,
        user_group: UserGroupRepository,
        topic_attempt: TopicAttemptRepository,
        question_attempt: QuestionAttemptRepository
    ):
        self._course_repo = course_repo
        self._user_group = user_group
        self._topic_repo = topic_repository
        self._user_topic_repo = user_topic_repository
        self._question_repo = question_repo
        self._progress_service = progress_service
        self._adaptivity_service = adaptivity_service
        self._topic_attempt = topic_attempt
        self._question_attempt = question_attempt
    

    @database.atomic()
    def get_topics_by_course(
        self, 
        course_id: int
    ) -> JSONResponse:
        """Public method which retuns list of topic by course

        Args:
            course_id (int): unique id of course from which topics getted

        Returns:
            JSONResponse: response with list of topic 
        """

        current_course = self._course_repo.get_by_id(course_id, True)
        topics = self._topic_repo.select_where(by_course = current_course)

        return JSONResponse([topic.dump for topic in topics])


    @database.atomic()
    def get_user_topics_by_user_group(
        self, 
        user: UserOut, 
        user_group_id: int
    ) -> JSONResponse:
        """Public method which returns list of user topic by user course

        Args:
            user (UserOut): current user
            user_course_id (int): unique id of user course from which user topic getted

        Returns:
            JSONResponse: response with list of user topics in the specified user course
        """

        user_group = self._user_group.get_or_none(
            True,
            id = user_group_id, 
            user = user.username
        )
        user_topics = self._user_topic_repo.get_user_topics_by_user_group(user_group)
        
        return JSONResponse([user_topic.dump for user_topic in user_topics])
    
    
    @database.atomic()
    def start_topic_by_user_topic(
        self, 
        user: UserOut, 
        user_topic_id: int
    ) -> JSONResponse:
        """Public method which get list of questions by topic & add to adaptive questions to it & formatted and returns that list 

        Args:
            user (UserOut): current user
            user_topic_id (int): unique identificator of user topic for which geting question list

        Returns:
            JSONResponse: response with list of formatted questions to pass
        """

        user_topic = self._user_topic_repo.get_by_user_and_id(user, user_topic_id)
        self._progress_service.validate_topic_access(user_topic)
        current_topic: Topic = user_topic.topic # pyright: ignore

        questions = self._question_repo.get_active_questions_by_topic(current_topic)


        if current_topic.number_in_course:
            adaptive_questions = self._adaptivity_service.get_adaptive_questions(user_topic, len(questions))
            for question in adaptive_questions:
                questions.insert(random.randint(0, len(questions) - 1), question)


        self._topic_attempt.update_all(
            {'is_active': False},
            user_topic = user_topic,
            is_active = True
        )

        topic_attempt = self._topic_attempt.get_or_create(
            True,
            user_topic = user_topic,
            is_active = True
        )

        questions_with_answers = []

        for index, question in enumerate(questions):
            self._question_attempt.get_or_create(
                True,
                topic_attempt = topic_attempt,
                question = question,
                is_adaptive = question.by_topic != user_topic.topic,
                order_index = index
            )
            answers: List[Answer] = list(question.answers) # pyright: ignore

            questions_with_answers.append({
                **question.dump,
                "answer_options": [{
                    "id": answer.id,
                    "text": "" if question.question_type == "text" else answer.text
                } for answer in answers]
            })
        
        return JSONResponse({
            'topic_attempt_id': topic_attempt.id,
            'questions': questions_with_answers
        })
    

    @database.atomic()
    def sumbit_topic_answers(
        self, 
        user: UserOut, 
        topic_answers: TopicSubmitAnswers
    ) -> JSONResponse:
        """Public method which verify topic data from client & get score & saving result 

        Args:
            user (UserOut): current user
            topic_answers (TopicSubmitAnswers): data from client 

        Raises:
            HTTPException(400): raises when data from clien arent matches with data from database

        Returns:
            JSONResponce: response with topic score
        """

        user_topic = self._user_topic_repo.get_by_user_and_id(user, topic_answers.user_topic_id)
        self._progress_service.validate_topic_access(user_topic)
        topic_attempt = self._topic_attempt.get_or_none(
            True,
            user_topic = user_topic,
            id = topic_answers.topic_attempt_id,
            is_active = True
        )

        topic_score = 0
        submit_questions = topic_answers.questions
        attempt_questions: List[QuestionAttempt] = getattr(topic_attempt, 'questions')
        created_questions: List[Tuple[Question, bool]] = [(question.question, question.is_adaptive) for question in attempt_questions]  # pyright: ignore[reportAssignmentType]                

        created_questions.sort(key=lambda q: getattr(q[0], "id"))
        submit_questions.sort(key=lambda q: q.id)


        if len(submit_questions) != len(created_questions):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "u didn`t answer all questions"
            )
            
        question_count = len(submit_questions)
        
        for index, submit_question in enumerate(submit_questions):
            created_question = created_questions[index]

            if submit_question.id != created_question[0].id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST ,
                    "question IDs is not matches"
                )

            question_score = get_question_score(
                submit_question, created_question[0]
            )

            factor = self._adaptivity_service.get_question_factor(
                user_topic, 
                created_question[0],
                question_score
            )
            
            topic_score += question_score * factor / question_count
            
            if not created_question[1]:
                self._progress_service.save_question_results(
                user_topic, user, created_question[0],
                submit_question, question_score
            )

        self._progress_service.update_user_topic_score(
            user_topic, 
            min(topic_score, 1)
        )

        return JSONResponse({
            'score': topic_score
        })