from functools import lru_cache
from fastapi import Depends, dependencies
from repositories.group.group import GroupRepository
from repositories.group.user_group import UserGroupRepository
from repositories.question.question_weigth import QuestionWeigthRepository
from services import (
    US, SCS, STS, TCS, TQS, TTS, PS, AS
)
from repositories import (
    UserRepository, CourseRepository,
    TopicRepository, UserTopicRepository, UserQuestionRepository,
    AdaptiveQuestionRepository, UserTextAnswerRepository,
    AnswerRepository, QuestionRepository
)
from services.teacher.group import GroupService as TGS
from services.student.group import GroupService as SGS


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


@lru_cache(maxsize=None)
def get_user_group_repository():
    return UserGroupRepository()


@lru_cache(maxsize=None)
def get_question_weigth_repository():
    return QuestionWeigthRepository()


@lru_cache(maxsize=None)
def get_group_repo():
    return GroupRepository()


def get_progress_service(
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    topic_repo = Depends(get_topic_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    text_answer_repo = Depends(get_user_text_answer_repository),
    user_group = Depends(get_user_group_repository)
):
    return PS(
        user_group,
        user_topic_repo,
        user_question_repo,
        topic_repo,
        adaptive_question_repo,
        text_answer_repo
    )


def get_adaptivity_service(
    user_question_repo = Depends(get_user_question_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    progress_service = Depends(get_progress_service),
):
    return AS(
        user_question_repo,
        adaptive_question_repo,
        user_topic_repo,
        progress_service
    )


def get_user_service(
    user_repo = Depends(get_user_repository)
) -> US:
    return US(
        user_repo
    )

def get_student_course_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    adaptive_question_repo = Depends(get_adaptive_question_repository),
    progress_service = Depends(get_progress_service),
    user_group = Depends(get_user_group_repository)
) -> SCS:
    return SCS(
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
        adaptive_question_repo,
        progress_service
    )


def get_student_topic_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    question_repo = Depends(get_question_repository),
    progress_service = Depends(get_progress_service),
    adaptivity_service = Depends(get_adaptivity_service),
    user_group = Depends(get_user_group_repository),
    question_weigth = Depends(get_question_weigth_repository)
):
    return STS(
        question_weigth,
        course_repo,
        topic_repo,
        user_topic_repo,
        user_question_repo,
        user_text_answer_repo,
        question_repo,
        progress_service,
        adaptivity_service,
        user_group
    )


def get_techer_topic_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_group = Depends(get_user_group_repository)
):
    return TTS(
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
    )


def get_techer_course_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    user_group = Depends(get_user_group_repository),
    group = Depends(get_group_repo)
):
    return TCS(
        group,
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
        user_text_answer_repo,
    )


def get_teacher_question_service(
    topic_repo = Depends(get_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    user_text_answer_repo = Depends(get_user_text_answer_repository),
    answer_repo = Depends(get_answer_repository),
    question_repo = Depends(get_question_repository),
    progress_service = Depends(get_progress_service),
    question_weigth = Depends(get_question_weigth_repository),
    group = Depends(get_group_repo)
):
    return TQS(
        topic_repo, 
        question_weigth,
        user_question_repo,
        user_text_answer_repo,
        answer_repo, 
        question_repo,
        progress_service,
        group
    )


def get_teacher_group_service(
    group = Depends(get_group_repo),
    course = Depends(get_course_repository),
    question = Depends(get_question_repository),
    question_weigth = Depends(get_question_weigth_repository)
):
    return TGS(
        group,
        course,
        question,
        question_weigth
    )


def get_student_group_service(
    group = Depends(get_group_repo),
    course = Depends(get_course_repository),
    user_group = Depends(get_user_group_repository),
    topic = Depends(get_topic_repository),
    user_topic = Depends(get_user_topic_repository),
    progress_service = Depends(get_progress_service),
):
    return SGS(
        group, 
        course,
        user_group,
        topic,
        user_topic,
        progress_service
    )