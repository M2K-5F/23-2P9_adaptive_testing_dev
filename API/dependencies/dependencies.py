from functools import lru_cache
from fastapi import Depends
from services import (
    US, SCS, STS, TCS, TQS, TTS
)
from repositories import (
    UserRepository, CourseRepository, UserCourseRepository,
    TopicRepository, UserTopicRepository, UserQuestionRepository,
    AdaptiveQuestionRepository, UserTextAnswerRepository,
    AnswerRepository, QuestionRepository
)


@lru_cache(maxsize=None)
def get_user_repository() -> UserRepository:
    return UserRepository()


@lru_cache(maxsize=None)
def get_course_repository() -> CourseRepository:
    return CourseRepository()


@lru_cache(maxsize=None)
def get_topic_repository() -> TopicRepository:
    return TopicRepository()


@lru_cache(maxsize=None)
def get_question_repository() -> QuestionRepository:
    return QuestionRepository()


@lru_cache(maxsize=None)
def get_answer_repository() -> AnswerRepository:
    return AnswerRepository()


@lru_cache(maxsize=None)
def get_user_course_repository() -> UserCourseRepository:
    return UserCourseRepository()


@lru_cache(maxsize=None)
def get_user_topic_repository() -> UserTopicRepository:
    return UserTopicRepository()


@lru_cache(maxsize=None)
def get_user_question_repository() -> UserQuestionRepository:
    return UserQuestionRepository()


@lru_cache(maxsize=None)
def get_user_text_answer_repository() -> UserTextAnswerRepository:
    return UserTextAnswerRepository()


@lru_cache(maxsize=None)
def get_adaptive_question_repository() -> AdaptiveQuestionRepository:
    return AdaptiveQuestionRepository()


def get_user_service(
    user_repo = Depends(get_user_repository)
) -> US:
    return US(
        user_repo
    )

def get_student_course_service(
    course_repo = Depends(get_course_repository),
    user_course_repo = Depends(get_user_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_qustion_repo = Depends(get_user_question_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository)
) -> SCS:
    return SCS(
        course_repo,
        user_course_repo,
        topic_repo,
        user_topic_repo,
        user_qustion_repo,
        adaptive_question_repo,
        user_text_answer_repo
    )


def get_student_topic_service(
    course_repo = Depends(get_course_repository),
    user_course_repo = Depends(get_user_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    answer_repo = Depends(get_answer_repository),
    question_repo = Depends(get_question_repository)
):
    return STS(
        course_repo,
        user_course_repo,
        topic_repo,
        user_topic_repo,
        user_question_repo,
        adaptive_question_repo,
        user_text_answer_repo,
        answer_repo,
        question_repo
    )


def get_techer_topic_service(
    course_repo = Depends(get_course_repository),
    user_course_repo = Depends(get_user_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    answer_repo = Depends(get_answer_repository),
    question_repo = Depends(get_question_repository)
):
    return TTS(
        course_repo,
        user_course_repo,
        topic_repo,
        user_topic_repo,
        user_question_repo,
        adaptive_question_repo,
        user_text_answer_repo,
        answer_repo,
        question_repo
    )


def get_techer_course_service(
    course_repo = Depends(get_course_repository),
    user_course_repo = Depends(get_user_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
):
    return TCS(
        course_repo,
        user_course_repo,
        topic_repo,
        user_topic_repo,
        user_question_repo,
        adaptive_question_repo,
        user_text_answer_repo,
    )


def get_teacher_question_service(
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    answer_repo = Depends(get_answer_repository),
    question_repo = Depends(get_question_repository)
):
    return TQS(
        topic_repo,
        user_topic_repo, 
        user_question_repo,
        user_text_answer_repo,
        answer_repo, 
        question_repo
    )