from repositories.course.course_repository import CourseRepository
from repositories.course.user_course_repository import UserCourseRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.user_question_repository import UserQuestionRepository
from repositories.question.adaptive_question_repository import AdaptiveQuestionRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from models import database
from services.common.progress_service import ProgressService
from shemas import UserOut
from fastapi.responses import JSONResponse


class CourseService:
    """Service for processing action with courses from student"""

    def __init__(
        self,
        course_repo: CourseRepository,
        user_course_repo: UserCourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        adaptive_question_repo: AdaptiveQuestionRepository,
        progress_service: ProgressService
    ):
        self._course_repo = course_repo
        self._topic_repo = topic_repository
        self._user_course_repo = user_course_repo
        self._user_topic_repo = user_topic_repository
        self._adaptive_question_repo = adaptive_question_repo
        self._progress_service = progress_service
    
    
    @database.atomic()
    def get_followed_courses(self, user: UserOut) -> JSONResponse:
        """Retrieve all active courses that the user is enrolled in.
        
        Args:
            user(UserOut): User object containing user information
            
        Returns:
            JSONResponse: List of active user courses with their details
        """

        followed_courses = self._user_course_repo.get_active_user_courses_from_user(user)
        return JSONResponse([uc.recdump for uc in followed_courses])


    @database.atomic()
    def follow_course(self, user: UserOut, course_id: int) -> JSONResponse:
        """Follow user to course & returns created user_course
    
        Args:
            user: current user
            course_id: unique id of course to follow
            
        Returns:
            JSONResponse: response with serialized user_course object
            
        Raises:
            HTTPException(400): If course is not active or is already followed
        """

        current_course = self._course_repo.get_by_id(course_id, True)
    
        if not current_course.is_active:
            raise self._course_repo._400_does_not_exist
        
        user_course, is_created = self._user_course_repo.get_or_create(
            False, {},
            user=user.username,
            course=current_course
        )
    
        if not is_created:
            if user_course.is_active:
                raise self._user_course_repo._400_does_not_exist
        
            else:
                user_course = self._user_course_repo.activate_user_course(user_course)
                return JSONResponse(user_course.dump)
        
        topics_by_course = self._topic_repo.get_active_topics_by_course(current_course)
    
        for index, topic in enumerate(topics_by_course):
            self._user_topic_repo.create_user_topic(
                topic, user.username, user_course,
                False if index != 0 else True
            )
    
        current_course = self._course_repo.add_student(current_course)        
    
        return JSONResponse(user_course.dump)


    @database.atomic()
    def unfollow_course(self, user: UserOut, course_id: int) -> JSONResponse:
        """Unfollow user to course & returns deleted user_course
    
        Args:
            user: current user
            course_id: unique id of course to unfollow
            
        Returns:
            JSONResponse: response with serialized user_course object
            
        Raises:
            HTTPException(400): If user course not exists
        """

        current_course = self._course_repo.get_by_id(course_id, True)
    
        if not current_course.is_active:
            raise self._course_repo._400_does_not_exist
        
        user_course = self._progress_service.clear_user_course_progress(user, current_course.id, True)  #pyright: ignore
        
        user_course.delete_instance()
        current_course = self._course_repo.remove_student(current_course)
    
        return JSONResponse(user_course.dump)


    @database.atomic()
    def get_course_by_id(self, user: UserOut, course_id: int) -> JSONResponse:
        """Returns Course instance with field 'user_course': user_course if user is followed on this course else False

        Args:
            user (UserOut): current user
            course_id (int): unique course id

        Returns:
            JSONResponse: Course instance with 'user_course' field
        """

        current_course = self._course_repo.get_by_id(course_id, True)

        try:
            followed_course = self._user_course_repo.get_active_user_course_from_user(user, current_course)
            self._adaptive_question_repo.delete_all(user = user.username)

            return JSONResponse({**current_course.dump, 'user_course': {**followed_course.dump}})

        except:
            return JSONResponse({**current_course.dump, 'user_course': False})
    

    @database.atomic()
    def clear_user_course_progress(self, user: UserOut, user_course_id: int) -> JSONResponse:
        """Delete all entries associated with user course

        Args:
            user (UserOut): current_user
            user_course_id (int): unique user_course id

        Returns:
            JSONResponse: returns user course with nullish progress
        """

        user_course = self._progress_service.clear_user_course_progress(user, user_course_id)

        return JSONResponse(user_course.dump)


    @database.atomic()
    def search_courses(self, user: UserOut, search_query: str):
        """Returns all Course instances with that title & not created by user

        Args:
            user (UserOut): current user
            search_query (str): search string

        Returns:
            JSONResponse: list of courses where title is search query 
        """

        searched_courses = self._course_repo.search_courses_by_title(user, search_query)
        
        return JSONResponse([course.dump for course in searched_courses])
