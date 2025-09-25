import random
from typing import List, Tuple
from fastapi import HTTPException
from config import weight_config
from repositories.course.course_repository import CourseRepository
from repositories.group.user_group import UserGroupRepository
from repositories.question.question_weight import QuestionWeightRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.user_question_repository import UserQuestionRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from repositories.question.question_repository import QuestionRepository
from models import Answer, Question, Topic, UserQuestion, database, UserTopic
from services.common.progress_service import ProgressService
from services.common.adaptivity_service import AdaptivityServise
from shemas import UserOut, TopicSubmitAnswers, SubmitQuestion
from fastapi.responses import JSONResponse
from fastapi import status
from utils.score_utils import get_question_score




class TopicService:
    """Service for processing action with topics from student"""

    def __init__(
        self,
        question_weight: QuestionWeightRepository,
        course_repo: CourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_question_repository: UserQuestionRepository,
        user_text_answer_repo: UserTextAnswerRepository,
        question_repo: QuestionRepository,
        progress_service: ProgressService,
        adaptivity_service: AdaptivityServise,
        user_group: UserGroupRepository
    ):
        self._question_weight = question_weight
        self._course_repo = course_repo
        self._user_group = user_group
        self._topic_repo = topic_repository
        self._user_topic_repo = user_topic_repository
        self._user_question_repo = user_question_repository
        self._user_text_answer_repo = user_text_answer_repo
        self._question_repo = question_repo
        self._progress_service = progress_service
        self._adaptivity_service = adaptivity_service
    

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

        questions_with_answers = []
        for question in questions:
            answers: List[Answer] = list(question.answers)  #pyright: ignore
            questions_with_answers.append({
                **question.dump,
                "answer_options": [{
                    "id": answer.id,
                    "text": "" if question.question_type == "text" else answer.text
                } for answer in answers]
            })
        
        # if not current_topic.number_in_course:
        return JSONResponse(questions_with_answers)
        
        questions_with_answers = self._adaptivity_service.add_adaptive_questions_to_response(user, user_topic, questions_with_answers)

        return JSONResponse(questions_with_answers)

    
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
        current_topic: Topic = user_topic.topic # pyright: ignore
        topic_score = 0

        self._progress_service.validate_topic_access(user_topic)


        submit_questions = topic_answers.questions

        created_questions = self._question_repo.get_active_questions_by_topic(current_topic)
        created_questions.sort(key=lambda q: getattr(q, "id"))
        submit_questions.sort(key=lambda q: q.id)


        if len(submit_questions) != len(created_questions):
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                "u didn`t answer all questions"
            )
            
        question_count = len(submit_questions)
        
        for index, submit_question in enumerate(submit_questions):
            created_question = created_questions[index]

            if submit_question.id != created_question.id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST ,
                    "question IDs is not matches"
                )

            question_score = get_question_score(
                submit_question, created_question
            )

            factor = self.save_question_results(
                user_topic, user, created_question, 
                submit_question, question_score
            )
            
            topic_score += question_score * factor / question_count
            
        if topic_score > 1:
            topic_score = 1

        self._progress_service.update_user_topic_score(
            user_topic, topic_score
        )

        return JSONResponse({
            'score': topic_score
        })
    

    def save_question_results(
            self, 
            user_topic: UserTopic,
            user: UserOut, 
            created_question: Question, 
            submit_question: SubmitQuestion, 
            question_score: float
    ) -> float:
        """Procedure which process saving question result based on score

        Args:
            user (UserOut): current user
            user_topic (UserTopic): user topic for which question is saved
            created_question (Question): question from database with unique id
            submit_question (SubmitQuestion): question data from client with topic id
            question_score (float): score of question to save result
        """

        user_question = self._user_question_repo.get_or_create_user_question(
            user.username, 
            submit_question.by_topic, 
            created_question
        )

        user_question = self._user_question_repo.update(
            user_question,
            progress = max(
                question_score, 
                user_question.progress # pyright: ignore
            )
        )

        question_weight = self._question_weight.get_or_none(
            True,
            question = created_question,
            group = user_topic.by_user_group.group
        )

        weight: float = question_weight.weight  # pyright: ignore[reportAssignmentType]
        step: float = question_weight.step  # pyright: ignore[reportAssignmentType]
        max_w: float = question_weight.max_weight  # pyright: ignore[reportAssignmentType]
        min_w: float = question_weight.min_weight  # pyright: ignore[reportAssignmentType]
        score_step = (((question_score - 0.5) * 2 ) * step)
        updated_weight = weight - float(round(score_step, 4))

        self._question_weight.update(
            question_weight, 
            weight = min(max(min_w, updated_weight), max_w)
        )

        if submit_question.type == 'text':
            user_answer = self._user_text_answer_repo.create_user_text_answer(
                user, 
                created_question, 
                submit_question.by_topic, 
                user_question, 
                submit_question.text
            )

            self._user_text_answer_repo.update(
                user_answer,
                progress = max(
                    user_answer.progress,  # pyright: ignore
                    bool(question_score)
                )
            )

        return max(weight / weight_config.BASE_WEIGHT, user_topic.topic.score_for_pass)