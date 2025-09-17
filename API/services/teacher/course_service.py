from repositories.course.course_repository import CourseRepository
from repositories.course.user_course_repository import UserCourseRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.user_question_repository import UserQuestionRepository
from repositories.question.adaptive_question_repository import AdaptiveQuestionRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from models import database
from fastapi import HTTPException, status
from shemas import UserOut
from fastapi.responses import JSONResponse


class CourseService:
    """Service for processing action with courses from teacher"""

    def __init__(
        self,
        course_repo: CourseRepository,
        user_course_repo: UserCourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_text_answer_repo: UserTextAnswerRepository
    ):
        self._course_repo = course_repo
        self._topic_repo = topic_repository
        self._user_course_repo = user_course_repo
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
    def get_created_by_teacher_courses(self, user: UserOut):
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

        user_courses = self._user_course_repo.get_user_courses_by_course(current_course)
        
        statistics = []
        avg_course_progress = 0
        
        for user_course in user_courses:
                student = user_course.user
            
                topics = self._topic_repo.select_where(by_course = current_course)
                topics.sort(key=lambda t: t.number_in_course) # pyright: ignore
                
                avg_course_progress += round(user_course.course_progress, 2) # pyright: ignore
                
                student_stats = {
                    'user_id': student.id,
                    'username': student.username,
                    "telegram_link": student.telegram_link,
                    'name': student.name,
                    'course_progress': round(user_course.course_progress, 2), # pyright: ignore
                    'completed_topics': user_course.completed_topic_number,
                    'total_topics': len(topics),
                    'topics_details': []
                }
                
                for topic in topics:
                        user_topic = self._user_topic_repo.get_or_none(False,
                            user = student.username,
                            topic = topic.id,
                            by_user_course = user_course.id
                        )
                        
                        if not user_topic:
                            student_stats['topics_details'].append({
                                'topic_id': topic.id,
                                'topic_title': topic.title,
                                'is_completed': False,
                                'topic_progress': 0,
                                'question_count': topic.question_count,
                                'average_score': 0,
                                'ready_to_pass': False,
                                'unsubmited_answers': []
                            })
                        else:
                            unsubmited_text_answers = self._user_text_answer_repo.get_unsubmited_answers_by_user_topic(user_topic)
                        
                            student_stats['topics_details'].append({
                                'topic_id': topic.id,
                                'topic_title': topic.title,
                                'is_completed': user_topic.is_completed,
                                'topic_progress': round(user_topic.topic_progress, 3), # pyright: ignore
                                'question_count': topic.question_count,
                                'average_score': round(user_topic.topic_progress * 100, 2), # pyright: ignore
                                'ready_to_pass': user_topic.ready_to_pass,
                                'unsubmited_answers': [a.dump for a in unsubmited_text_answers]
                            })
                
                statistics.append(student_stats)

        to_return = {
            "course_id": course_id,
            "course_title": current_course.title,
            "average_progress": round(avg_course_progress / len(statistics), 2) if len(statistics) else 0,
            "total_students": len(statistics),
            "students": statistics
        }
        
        return JSONResponse(to_return)