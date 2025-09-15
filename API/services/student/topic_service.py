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
from models import Answer, Question, Topic, UserCourse, UserQuestion, database, UserTopic
from services.common.progress_service import ProgressService
from shemas import SubmitChoiceQuestionUnit, SubmitTextQuestionUnit, UserOut, TopicSubmitAnswers, SubmitQuestion
from fastapi.responses import JSONResponse
from fastapi import status
from utils.score_utils import get_question_score, get_average_score




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
        question_repo: QuestionRepository,
        progress_service: ProgressService
    ):
        self.course_repo = course_repo
        self.topic_repo = topic_repository
        self.user_course_repo = user_course_repo
        self.user_topic_repo = user_topic_repository
        self.user_question_repo = user_question_repository
        self.adaptive_question_repo = adaptive_question_repo
        self.user_text_answer_repo = user_text_answer_repo
        self.question_repo = question_repo
        self.progress_service = progress_service
    
    @database.atomic()
    def get_topics_by_course(self, course_id: int) -> JSONResponse:
        current_course = self.course_repo.get_by_id(course_id, True)
        topics = self.topic_repo.select_where(by_course = current_course)

        return JSONResponse([topic.dump for topic in topics])


    @database.atomic()
    def get_user_topics_by_followed_course(self, user: UserOut, user_course_id: int) -> JSONResponse:
        user_course = self.user_course_repo.get_active_user_course_from_user_and_id(user, user_course_id)
        user_topics = self.user_topic_repo.get_user_topics_by_user_course(user_course)
        
        return JSONResponse([user_topic.dump for user_topic in user_topics])


    @database.atomic()
    def add_adaptive_questions_to_response(self, user: UserOut, user_topic: UserTopic, questions_list: List[dict]) -> JSONResponse:
        user_questions = self.user_question_repo.get_user_questions_with_low_score(user_topic)
        adaptive_questions: list[UserQuestion] = []

        for _ in range(min(2, len(user_questions))):
            question = random.choice(user_questions)
            user_questions.remove(question)
            adaptive_questions.append(question)
        
        for user_question in adaptive_questions:
            self.adaptive_question_repo.create_adaptive_question(
                user, user_topic, user_question
            )
            questions_list.insert(
                random.randint(0, len(questions_list)-1),
                {
                    **user_question.question.dump,
                    "answer_options": [{
                            "id": answer.id,
                            "text": "" if user_question.question.question_type == 'text' else answer.text
                        } for answer in user_question.question.created_answers]
                }
            )
        
        return JSONResponse(questions_list)
    
    
    @database.atomic()
    def start_topic_by_user_topic(self, user: UserOut, user_topic_id: int) -> JSONResponse:
        user_topic = self.user_topic_repo.get_by_user_and_id(user, user_topic_id)

        self.progress_service.validate_topic_acess(user_topic)
        
        current_topic: Topic = user_topic.topic # pyright: ignore

        questions = self.question_repo.get_active_questions_by_topic(current_topic)

        questions_with_answers = []
        for question in questions:
            answers: List[Answer] = list(question.created_answers)  #pyright: ignore
            questions_with_answers.append({
                **question.dump,
                "answer_options": [{
                    "id": answer.id,
                    "text": "" if question.question_type == "text" else answer.text
                } for answer in answers]
            })
        
        if not current_topic.number_in_course:
            return JSONResponse(questions_with_answers)
        
        return self.add_adaptive_questions_to_response(user, user_topic, questions_with_answers)

    
    @database.atomic()
    def sumbit_topic_answers(self, user: UserOut, topic_answers: TopicSubmitAnswers):
        user_topic = self.user_topic_repo.get_by_user_and_id(user, topic_answers.user_topic_id)
        current_topic: Topic = user_topic.topic # pyright: ignore

        self.progress_service.validate_topic_acess(user_topic)
        
        
        topic_score = 0
        submit_questions = topic_answers.questions
        submit_adaptive_questions: List[SubmitQuestion] = list(
            filter(lambda q: q.by_topic != user_topic.topic.id , submit_questions)
        )

        created_questions = self.question_repo.get_active_questions_by_topic(current_topic)

        for q in submit_adaptive_questions:
            adaptive_question = self.adaptive_question_repo.get_adaptive_question(q.id, user_topic)
            current_question: Question = adaptive_question.question # pyright: ignore
            created_questions.append(current_question)
        
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
            topic_score += question_score / question_count

            self.save_question_results(
                user, user_topic, created_question, 
                submit_question, question_score
            )
            
        self.progress_service.update_user_topic_score(
            user_topic, topic_score
        )

        return JSONResponse({'score': topic_score})
    

    def save_question_results(
            self, 
            user: UserOut, 
            user_topic: UserTopic, 
            created_question: Question, 
            submit_question: SubmitQuestion, 
            question_score: float
    ):
        user_question = self.user_question_repo.get_or_create_user_question(
            user.username, 
            submit_question.by_topic, 
            created_question
        )

        user_question = self.user_question_repo.update(
            user_question,
            question_score = max(
                question_score, 
                user_question.question_score # pyright: ignore
            )
        )

        if submit_question.type == 'text':
            user_answer = self.user_text_answer_repo.create_user_text_answer(
                user, created_question, user_topic, user_question, submit_question.text
            )

            self.user_text_answer_repo.update(
                user_answer,
                is_correct = max(
                    user_answer.is_correct, # pyright: ignore
                    bool(question_score)
                )
            )
        
        if submit_question.by_topic != user_topic.topic.id:
            self.save_adaptive_question_results(
                user, user_topic, submit_question
            )


    def save_adaptive_question_results(
        self, user: UserOut, user_topic: UserTopic,
        submit_question: SubmitQuestion
    ):
        user_topic_by_question = self.user_topic_repo.get_or_none(True,
            user = user.username,
            topic = submit_question.by_topic
        )
        
        user_questions_by_user_topic = self.user_question_repo.get_by_user_topic(
            user_topic_by_question
        )
        
        user_topic_score = get_average_score(
            user_questions_by_user_topic, 
            lambda q: q.question_score
        )

        self.progress_service.update_user_topic_score(
            user_topic_by_question,
            max(
                user_topic_score, 
                user_topic_by_question.topic_progress # pyright: ignore
            )
        )

        self.adaptive_question_repo.delete(True, 
            question = submit_question.id, 
            for_user_topic = user_topic
        )    
