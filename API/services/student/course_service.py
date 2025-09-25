from repositories.course.course_repository import CourseRepository
from repositories.group import user_group
from repositories.group.user_group import UserGroupRepository
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
        user_group: UserGroupRepository,
        course_repo: CourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        adaptive_question_repo: AdaptiveQuestionRepository,
        progress_service: ProgressService
    ):
        self._course_repo = course_repo
        self._user_group = user_group
        self._topic_repo = topic_repository
        self._user_topic_repo = user_topic_repository
        self._adaptive_question_repo = adaptive_question_repo
        self._progress_service = progress_service


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

        user_group = self._user_group.get_or_none(
            False,
            user = user.username,
            course = current_course
        )
        self._adaptive_question_repo.delete_all(user = user.username)

        if user_group:
            return JSONResponse({**current_course.dump, 'user_group': {**user_group.dump}})

        return JSONResponse({**current_course.dump, 'user_group': False})


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
