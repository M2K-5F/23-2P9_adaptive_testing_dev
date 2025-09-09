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
            answers = list(user_question.question.created_answers)
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

        if not user_topic.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                'This user_topic are inactive'
            )

        if not user_topic.ready_to_pass:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, 
                'u cannot pass this topic, please pass previous'
            )
        
        current_topic: Topic = user_topic.topic # pyright: ignore

        questions = self.question_repo.get_active_questions_by_topic(current_topic)

        questions_with_answers = []
        for question in questions:
            answers: List[Answer] = list(question.created_answers)
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

            topic_score, question_score = self.get_question_score(
                topic_score, submit_question, 
                created_question, question_count
            )

            self.save_question_results(
                user, user_topic, created_question, 
                submit_question, question_score
            )
        
        response = self.save_user_topic_result(user_topic, topic_score)

        return response



    def get_question_score(
        self, topic_score: float, submit_question: SubmitQuestion, 
        created_question: Question, questions_count: int
    ):
        if submit_question.type == 'choice':
            if created_question.question_type == 'text':
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "question types not matches"
                )

            topic_score, question_score = self.get_choice_question_score(
                submit_question, questions_count,
                topic_score
            )
            
        else:
            if created_question.question_type != 'text':
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, 
                    "question types not matches"
                )
            
            topic_score, question_score = self.get_text_question_score(
                submit_question, 
                questions_count, topic_score
            )
        
        return (topic_score, question_score)


    def get_choice_question_score(
        self, submit_question: SubmitChoiceQuestionUnit, 
        questions_count: int, topic_score: float
    ):
        submit_answers = submit_question.answer_options
        created_answers = self.answer_repo.select_where(by_question = submit_question.id)

        submit_answers.sort(key=lambda ans: ans.id)
        created_answers.sort(key=lambda a: getattr(a, "id"))

        if len(submit_answers) != len(created_answers):
            raise HTTPException(400, 'u didn`t answer all answers')

        answer_count = len(submit_answers)
        question_score = 0

        for index, submit_answer in enumerate(submit_answers):
            created_answer: Answer = created_answers[index]
            if created_answer.id != submit_answer.id:
                raise HTTPException(400, 'answer IDs is not matches')

            if created_answer.is_correct == submit_answer.is_correct:
                topic_score += 1 / (answer_count * questions_count)
                question_score += 1 / answer_count
        
        return (topic_score, question_score)

    
    def get_text_question_score(
        self, submit_question: SubmitTextQuestionUnit, 
        questions_count: int, topic_score: float
    ):
        created_answers = self.answer_repo.select_where(by_question = submit_question.id)
        question_score = 0

        for created_answer in created_answers:
            if created_answer.text == submit_question.text:
                question_score = 1
                topic_score += ( 1 / questions_count )
                break
        return (topic_score, question_score)


    def save_question_results(self, user: UserOut, user_topic: UserTopic, created_question: Question, submit_question: SubmitQuestion, question_score: float):
        if submit_question.by_topic == user_topic.topic.id:
            self.save_static_question_results(
                user, user_topic, created_question, 
                submit_question, question_score
            )
        
        else:
            self.save_adaptive_question_results(
                user, user_topic, created_question, 
                submit_question, question_score
            )


    def save_static_question_results( 
        self, user: UserOut, user_topic: UserTopic, created_question: Question, 
        submit_question: SubmitQuestion, question_score: float
    ):
        user_question = self.user_question_repo.create_user_question(
            user, user_topic, created_question
        )
        user_question.question_score = max(
            question_score, 
            user_question.question_score # pyright: ignore
        )  
        user_question.save()

        if submit_question.type == 'text':
            user_answer = self.user_text_answer_repo.create_user_text_answer(
                user, created_question, user_topic, user_question, submit_question.text
            )
            user_answer.is_correct = max(
                user_answer.is_correct, # pyright: ignore
                bool(question_score)
            )
            user_answer.save()

    
    def save_adaptive_question_results(
        self, user: UserOut, user_topic: UserTopic, created_question: Question, 
        submit_question: SubmitQuestion, question_score: float
    ):
        user_question = self.user_question_repo.get_or_none(True,
            question = submit_question.id,
            usr = user.username
        )

        user_question.question_score = max(
            question_score, 
            user_question.question_score # pyright: ignore
        )
        user_question.save()

        if submit_question.type == 'text':
            user_answer = self.user_text_answer_repo.get_or_none(True,
                by_user_topic = user_question.by_user_topic,
                for_user_question = user_question
            )
            user_answer.is_correct = bool(question_score)
            user_answer.save()

        question_user_topic = self.user_topic_repo.get_or_none(True,
            user = user.username,
            topic = submit_question.by_topic
        )
        
        user_questions_by_user_topic = self.user_question_repo.get_by_user_topic(question_user_topic)
        
        user_topic_score = 0

        for question in user_questions_by_user_topic:
            user_topic_score += question.question_score / len(user_questions_by_user_topic)  # pyright: ignore

        question_user_topic.topic_progress = max(
            user_topic_score, 
            question_user_topic.topic_progress
        )
        question_user_topic.save()

        self.adaptive_question_repo.delete(True, 
            question = submit_question.id, 
            for_user_topic = user_topic
        )


    def save_user_topic_result(self, user_topic: UserTopic, topic_score: float):
        if user_topic.topic_progress < topic_score:  # pyright: ignore
            user_topic.topic_progress = round(topic_score, 3)  

        if user_topic.topic_progress >= 0.8 and not user_topic.is_completed:  # pyright: ignore
            user_course: UserCourse = user_topic.by_user_course  # pyright: ignore
            
            user_course.completed_topic_number = user_course.completed_topic_number + 1
            user_topic.is_completed = True
            user_course.course_progress = (
                user_course.completed_topic_number / 
                len(self.topic_repo.get_active_topics_by_course(user_course.course))  # pyright: ignore
            ) * 100
            
            user_course.save()

            next_user_topic = self.user_topic_repo.get_next_user_topic(user_topic)

            if next_user_topic:
                next_user_topic.ready_to_pass = True
                next_user_topic.save()
        
        user_topic.save()


        return JSONResponse({'score': round(topic_score, 3)})