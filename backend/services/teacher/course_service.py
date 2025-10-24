from ast import Dict
from decimal import DivisionByZero
from operator import truediv
from typing import Any, List, Optional
from backend.repositories.question.question_repository import QuestionRepository
from backend.repositories.question.question_weight import QuestionWeightRepository
from backend.repositories.question.user_question_repository import UserQuestionRepository
from repositories.course.course_repository import CourseRepository
from repositories.group.group import GroupRepository
from repositories.group.user_group import UserGroupRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from models import Group, UserQuestion, UserTopic, WeightProfile, database
from fastapi import HTTPException, status
from shemas import UserOut
from fastapi.responses import JSONResponse


class CourseService:
    """Service for processing action with courses from teacher"""

    def __init__(
        self,
        user_question: UserQuestionRepository,
        question: QuestionRepository,
        question_weight: QuestionWeightRepository,
        group: GroupRepository,
        user_group: UserGroupRepository,
        course_repo: CourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_text_answer_repo: UserTextAnswerRepository
    ):
        self._course_repo = course_repo
        self.user_question = user_question
        self.question = question
        self.question_weight = question_weight
        self._group = group
        self._user_group = user_group
        self._topic_repo = topic_repository
        self._user_topic_repo = user_topic_repository
        self._user_text_answer_repo = user_text_answer_repo


    @database.atomic()
    def create_course(self, course_title, course_description, user: UserOut):     
        """Create course and return instance

        Args:
            course_title (str): title of new course
            course_description (str): description of new course
            user (UserOut): current user

        Returns:
            JSONResponse: created course instance
        """

        created_course = self._course_repo.get_or_create(
            True, {},
            title = course_title,
            created_by = user.username,
            description = course_description
        )

        return JSONResponse(created_course.dump)


    @database.atomic()
    def arch_course(self, course_id: int, user: UserOut):
        """Archivate course & deactivate all user_topics associated with that course

        Args:
            course_id (int): unique course id
            user (UserOut): current user
            
        Raises:
            HTTPException(400): if course already archived

        Returns:
            JSONResponse: archived course instance
        """

        current_course = self._course_repo.get_by_id(course_id, True)
        
        if not current_course.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Already archivated"
            )

        if current_course.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Course wasn`t created by you"
            )
        
        current_course = self._course_repo.update(
            current_course,
            is_active = False
        )

        self._user_topic_repo.disable_activeness_by_course(current_course)

        return JSONResponse(current_course.dump)

    
    @database.atomic()
    def unarch_course(self, course_id: int, user: UserOut):
        """Unarchivate course & activate all user_topics associated with that course

        Args:
            course_id (int): unique course id
            user (UserOut): current user
            
        Raises:
            HTTPException(400): if course already unarchived

        Returns:
            JSONResponse: unarchived course instance
        """

        current_course = self._course_repo.get_by_id(course_id, True)
        
        if current_course.is_active:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Already active"
            )

        if current_course.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Course wasn`t created by you"
            )

        current_course = self._course_repo.update_by_instance(current_course, {
            'is_active': True
        })

        self._user_topic_repo.enable_activeness_by_course(current_course)

        return JSONResponse(current_course.dump)
    
    
    @database.atomic()
    def get_teacher_courses(self, user: UserOut):
        """Returns courses which be created by user

        Args:
            user (UserOut): current user

        Returns:
            JSONResponse: list of courses
        """

        courses = self._course_repo.select_where(created_by = user.username)

        return JSONResponse([course.dump for course in courses])


    @database.atomic()
    def get_course_statistics(self, user: UserOut, course_id: int) -> JSONResponse:
        """Returns detailed statistics by course with adaptive parameters"""
        
        current_course = self._course_repo.get_by_id(course_id, True)
        if current_course.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Course wasn't created by you"
            )
        
        topics = self._topic_repo.select_where(by_course=current_course)
        topics.sort(key=lambda t: t.number_in_course)  # pyright: ignore
        
        course_stats = {
            "course_id": str(course_id),
            "course_title": current_course.title,
            "meta": {
                "avg_progress": 0,
                "total_students": current_course.student_count,
                "completed_user_groups": 0
            },
            "group_details": []
        }
        
        total_course_progress = 0
        group_count = 0
        completed_user_groups = 0
        
        groups_by_course = self._group.select_where(by_course=current_course)
        
        for group in groups_by_course:
            # Получаем профили адаптивности
            adaptive_profile = None
            weight_profile = None
            avg_question_weight = 0
            
            if group.profile:
                adaptive_profile = {
                    "name": group.profile.name,
                    "question_weight": group.profile.question_weight,
                    "last_score": group.profile.last_score,
                    "time_since_last": group.profile.time_since_last,
                    "max_adaptive_questions_count": group.profile.max_adaptive_questions_count,
                    "max_adaptive_questions_ratio": group.profile.max_adaptive_questions_ratio
                }
            
            # Получаем профиль весов и средний вес вопросов
            weight_profile_data = self._get_group_weight_profile(group)
            weight_profile = weight_profile_data['profile']
            avg_question_weight = weight_profile_data['avg_weight']
            avg_base_weight = weight_profile_data['avg_base_weight']
            
            group_stats = {
                "id": group.id,
                "title": group.title,
                "avg_progress": 0,
                "max_student_count": group.max_student_count,
                "student_count": group.student_count,
                "adaptive_profile": adaptive_profile,
                "weight_profile": weight_profile,
                "avg_base_weight": round(avg_base_weight, 2),
                "avg_question_weight": round(avg_question_weight, 2),
                "user_group_details": []
            }
            
            total_group_progress = 0
            user_group_count = 0
            
            user_groups = self._user_group.select_where(group=group)
            
            for user_group in user_groups:
                user_group_count += 1
                total_group_progress += user_group.progress
                
                if user_group.progress == 1:
                    completed_user_groups += 1
                
                user_stats = {
                    "user": user_group.user.dump,
                    "progress": round(user_group.progress, 3),  # pyright: ignore
                    "completed_topics": user_group.completed_topic_count,
                    "total_topics": len(topics),
                    "user_topic_details": []
                }
                
                user_topics = self._user_topic_repo.get_user_topics_by_user_group(user_group)
                
                for user_topic in user_topics:
                    unsubmited_answers = self._user_text_answer_repo.get_unsubmited_answers_by_user_topic(user_topic)
                    question_scores = self._get_topic_question_scores(user_topic, group)
                    
                    topic_stats = {
                        "topic_title": user_topic.topic.title,
                        "is_completed": user_topic.is_completed,
                        "score_for_pass": user_topic.topic.score_for_pass,
                        "progress": round(user_topic.progress, 3),  # pyright: ignore
                        "question_count": user_topic.topic.question_count,
                        "ready_to_pass": user_topic.is_available,
                        "attempt_count": user_topic.attempt_count,
                        "unsubmited_answers": [a.dump for a in unsubmited_answers],
                        "question_scores": question_scores
                    }
                    
                    user_stats["user_topic_details"].append(topic_stats)
                
                group_stats["user_group_details"].append(user_stats)
            
            # Расчет среднего прогресса группы
            if user_group_count > 0:
                group_stats["avg_progress"] = round(total_group_progress / user_group_count, 3)  # pyright: ignore
                total_course_progress += group_stats["avg_progress"]
                group_count += 1
            
            course_stats["group_details"].append(group_stats)
        
        # Расчет общего прогресса курса
        if group_count > 0:
            course_stats["meta"]["avg_progress"] = round(total_course_progress / group_count, 3)
        course_stats["meta"]["completed_user_groups"] = completed_user_groups
        
        return JSONResponse(course_stats)

    def _get_group_weight_profile(self, group: Group) -> dict:
        """Получает профиль весов и средний вес для группы"""
        question_weights = self.question_weight.select_where(
            group = group
        )
        
        # Берем профиль из первого вопроса (они все одинаковые в группе)
        first_weight = question_weights[0]
        profile = None
        
        if first_weight.profile:
            profile = {
                "name": first_weight.profile.name,
                "base_weight": first_weight.profile.base_weight,
                "base_step": first_weight.profile.base_step,
                "min_weight": first_weight.profile.min_weight,
                "max_weight": first_weight.profile.max_weight,
                "score_bias": first_weight.profile.score_bias
            }
        
        # Расчет среднего веса вопросов
        avg_weight = sum(qw.weight for qw in question_weights) / len(question_weights)
        avg_base_weight = sum(qw.profile.base_weight for qw in question_weights) / len(question_weights)
        
        return {
            "profile": profile,
            "avg_weight": avg_weight,
            "avg_base_weight": avg_base_weight
        }

    def _get_topic_question_scores(self, user_topic: UserTopic, group: Group) -> List[Dict]:
        """Получает детальные баллы по вопросам темы для студента"""
        question_scores = []
        
        topic_questions = self.question.select_where(
            by_topic = user_topic.topic,
            is_active = True
        )
        
        for question in topic_questions:
            user_question = self.user_question.get_or_none(
                False,
                user = user_topic.user,
                is_active = True,
                question = question,
                by_user_topic = user_topic
            )
            
            if user_question:
                question_weight = self.question_weight.get_or_none(
                    True,
                    question = question,
                    group = group
                )
                
                weight_value = question_weight.weight
                
                score_data = {
                    "question_id": question.id,
                    "question_text": question.text,
                    "score": user_question.progress,
                    "weight": weight_value,
                    "is_adaptive": False
                }
                
                question_scores.append(score_data)
        
        return question_scores