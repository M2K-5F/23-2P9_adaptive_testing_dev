from repositories.course.course_repository import CourseRepository
from repositories.course.user_course_repository import UserCourseRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from repositories.question.user_question_repository import UserQuestionRepository
from repositories.question.adaptive_question_repository import AdaptiveQuestionRepository
from repositories.answer.user_text_answer_repository import UserTextAnswerRepository
from db import database
from shemas import UserOut
from fastapi.responses import JSONResponse


class CourseService:
    def __init__(
        self,
        course_repo: CourseRepository,
        user_course_repo: UserCourseRepository,
        topic_repository: TopicRepository,
        user_topic_repository: UserTopicRepository,
        user_question_repository: UserQuestionRepository,
        adaptive_question_repo: AdaptiveQuestionRepository,
        user_text_answer_repo: UserTextAnswerRepository
    ):
        self.course_repo = course_repo
        self.topic_repo = topic_repository
        self.user_course_repo = user_course_repo
        self.user_topic_repo = user_topic_repository
        self.user_question_repo = user_question_repository
        self.adaptive_question_repo = adaptive_question_repo
        self.user_text_answer_repo = user_text_answer_repo
    
    
    @database.atomic()
    def get_followed_courses(self, user: UserOut) -> JSONResponse:
        followed_courses = self.user_course_repo.get_active_user_courses_from_user(user)
        return JSONResponse([uc.recdump for uc in followed_courses])


    @database.atomic()
    def follow_course(self, user: UserOut, course_id: int) -> JSONResponse:
        current_course = self.course_repo.get_by_id(course_id, True)
    
        if not current_course.is_active:
            raise self.course_repo._404_not_fount
        
        user_course, is_created = self.user_course_repo.get_or_create(
            False, {},
            user=user.username,
            course=current_course
        )
    
        if not is_created:
            if user_course.is_active:
                raise self.user_course_repo._400_does_not_exist
        
            else:
                user_course = self.user_course_repo.activate_user_course(user_course)
                return JSONResponse(user_course.dump)
        
        topics_by_course = self.topic_repo.get_active_topics_by_course(current_course)
    
        for index, topic in enumerate(topics_by_course):
            self.user_topic_repo.create_user_topic(
                topic, user.username, user_course,
                False if index != 0 else True
            )
    
        current_course = self.course_repo.add_student(current_course)        
    
        return JSONResponse(user_course.dump)


    @database.atomic()
    def unfollow_course(self, user: UserOut, course_id: int) -> JSONResponse:
        current_course = self.course_repo.get_by_id(course_id, True)
    
        if not current_course.is_active:
            raise self.course_repo._404_not_fount
        
        user_course = self.user_course_repo.get_active_user_course_from_user(
            user, current_course
        )
    
        user_topics = self.user_topic_repo.get_user_topics_by_user_course(user_course)
        for ut in user_topics:
            ut.delete_instance()
        
        user_course.delete_instance()
        current_course = self.course_repo.remove_student(current_course)
    
        return JSONResponse(user_course.dump)


    @database.atomic()
    def get_course_by_id(self, user: UserOut, course_id: int) -> JSONResponse:
        current_course = self.course_repo.get_by_id(course_id, True)

        try:
            followed_course = self.user_course_repo.get_active_user_course_from_user(user, current_course)
            self.adaptive_question_repo.delete_all(user = user.username)

            return JSONResponse({**current_course.dump, 'user_course': {**followed_course.dump}})

        except:
            return JSONResponse({**current_course.dump, 'user_course': False})
    

    @database.atomic()
    def clear_user_course_progress(self, user: UserOut, user_course_id: int) -> JSONResponse:
        user_course = self.user_course_repo.get_by_id(user_course_id, True)

        user_topics = self.user_topic_repo.get_user_topics_by_user_course(user_course)

        for user_topic in user_topics:
            self.user_question_repo.delete_all(by_user_topic=user_topic)
        
            self.adaptive_question_repo.delete_all(by_user_topic = user_topic)

            self.user_text_answer_repo.delete_all(by_user_topic = user_topic)

            self.user_topic_repo.clear_user_topic_progress(user_topic)
        
        user_course = self.user_course_repo.clear_user_course_progress(user_course)
        return JSONResponse(user_course.dump)


    @database.atomic()
    def search_courses(self, user: UserOut, search_query: str):
        searched_courses = self.course_repo.search_courses_by_title(user, search_query)
        
        return JSONResponse([course.dump for course in searched_courses])
