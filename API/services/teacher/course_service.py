from ast import Dict
from decimal import DivisionByZero
from typing import Any
from repositories.course.course_repository import CourseRepository
from repositories.group.group import GroupRepository
from repositories.group.user_group import UserGroupRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from models import database
from fastapi import HTTPException, status
from shemas import UserOut
from fastapi.responses import JSONResponse


class CourseService:
    """Service for processing action with courses from teacher"""

    def __init__(
        self,
        group: GroupRepository,
        user_group: UserGroupRepository,
        course_repo: CourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_text_answer_repo: UserTextAnswerRepository
    ):
        self._course_repo = course_repo
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
    def get_course_statistics(self, user: UserOut, course_id: int):
        """Returns statistics by course

        Args:
            user (UserOut): current user
            course_id (int): unique course id


        Returns:
            _type_: response with statistics by course
        """

        current_course = self._course_repo.get_by_id(course_id, True)
        if current_course.created_by.username != user.username:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Course wasn`t created by you"
            )
        topics = self._topic_repo.select_where(by_course = current_course)
        topics.sort(key=lambda t: t.number_in_course) # pyright: ignore

        course_stats = {
            "course_id": course_id,
            "course_title": current_course.title,
            "meta": None,         
            "group_details": []
        }
        
        avg_course_progress = 0
        group_count = 0
        students_count = 0
        completed_user_groups = 0


        groups_by_course = self._group.select_where(by_course = current_course)
        for group in groups_by_course:
            avg_group_progress = 0
            user_group_count = 0

            if group.student_count > 0:
                group_count += 1

            group_stats = {
                "id": group.id,
                "avg_progress": 0,
                "title": group.title,
                "max_student_count": group.max_student_count,
                "student_count": group.student_count,
                "user_group_details": []
            }
            user_groups = self._user_group.select_where(group = group)

            for user_group in user_groups:
                user_group_count += 1
                avg_group_progress += user_group.progress
                students_count += 1
                if user_group.progress == 1:
                    completed_user_groups += 1
                
                user_group_stats = {
                    "user": user_group.user.dump,
                    'progress': round(user_group.progress, 2), # pyright: ignore
                    'completed_topics': user_group.completed_topic_count,
                    'total_topics': len(topics),
                    'user_topic_details': []
                }

                user_topics = self._user_topic_repo.get_user_topics_by_user_group(user_group)
                
                for user_topic in user_topics:
                    unsubmited_text_answers = self._user_text_answer_repo.get_unsubmited_answers_by_user_topic(user_topic)
                
                    user_group_stats['user_topic_details'].append({
                        'topic_title': user_topic.topic.title,
                        "attempt_count": user_topic.attempt_count,
                        'is_completed': user_topic.is_completed,
                        'score_for_pass': user_topic.topic.score_for_pass,
                        'progress': round(user_topic.progress, 3), # pyright: ignore
                        'question_count': user_topic.topic.question_count,
                        'ready_to_pass': user_topic.is_available,
                        'unsubmited_answers': [a.dump for a in unsubmited_text_answers]
                    })
                
                group_stats["user_group_details"].append(user_group_stats)
            
            try:
                group_stats["avg_progress"] = avg_group_progress / user_group_count
            except ZeroDivisionError:
                group_stats["avg_progress"] = 0

            avg_course_progress += group_stats["avg_progress"]

            course_stats["group_details"].append(group_stats)
        
        try:
            avg_course_progress = avg_course_progress / group_count
        except ZeroDivisionError:
            avg_course_progress = 0

        meta = {
            "avg_progress": avg_course_progress,
            "total_students": current_course.student_count,
            "completed_user_groups": completed_user_groups
        }

        course_stats["meta"] = meta
        
        return JSONResponse(course_stats)