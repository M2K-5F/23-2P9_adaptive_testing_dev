from functools import lru_cache
from fastapi import Depends, dependencies
from backend.repositories.profiles.adaptivity import AdaptivityProfileRepository
from backend.repositories.profiles.weight import WeightProfileRepository
from repositories.attempt.question import QuestionAttemptRepository
from repositories.attempt.topic import TopicAttemptRepository
from repositories.group.group import GroupRepository
from repositories.group.user_group import UserGroupRepository
from repositories.question.question_weight import QuestionWeightRepository
from repositories import (
    UserRepository, CourseRepository,
    TopicRepository, UserTopicRepository, UserQuestionRepository,
    UserTextAnswerRepository,
    AnswerRepository, QuestionRepository
)
from services.teacher.group import GroupService as TeacherGroupService
from services.student.group import GroupService as StudentGroupService
from services.common.adaptivity_service import AdaptivityServise
from services.common.progress_service import ProgressService
from services.common.user_service import UserService
from services.student.course_service import CourseService as StudentCourseService
from services.student.topic_service import TopicService as StudentTopicService
from services.teacher.course_service import CourseService as TeacherCourseService
from services.teacher.question_service import QuestionService as TeacherQuestionService1
from services.teacher.topic_service import TopicService as TeacherTopicService


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
def get_user_group_repository() -> UserGroupRepository:
    return UserGroupRepository()


@lru_cache(maxsize=None)
def get_question_weight_repository() -> QuestionWeightRepository:
    return QuestionWeightRepository()


@lru_cache(maxsize=None)
def get_topic_attempt_repository() -> TopicAttemptRepository:
    return TopicAttemptRepository()


@lru_cache(maxsize=None)
def get_question_attempt_repository() -> QuestionAttemptRepository:
    return QuestionAttemptRepository()


@lru_cache(maxsize=None)
def get_group_repo() -> GroupRepository:
    return GroupRepository()


@lru_cache(maxsize=None)
def get_weight_profile_repository() -> WeightProfileRepository:
    return WeightProfileRepository()


@lru_cache(maxsize=None)
def get_adaptivity_profile_repository() -> AdaptivityProfileRepository:
    return AdaptivityProfileRepository()


def get_progress_service(
    user_topic_repo = Depends(get_user_topic_repository),
    user_question_repo = Depends(get_user_question_repository),
    text_answer_repo = Depends(get_user_text_answer_repository),
    user_group = Depends(get_user_group_repository),
    topic = Depends(get_topic_repository)
):
    return ProgressService(
        topic,
        user_group,
        user_topic_repo,
        user_question_repo,
        text_answer_repo,
    )


def get_adaptivity_service(
    user_question_repo = Depends(get_user_question_repository),
    question_weight = Depends(get_question_weight_repository)
):
    return AdaptivityServise(
        user_question_repo,
        question_weight
    )


def get_user_service(
    user_repo = Depends(get_user_repository)
):
    return UserService(
        user_repo
    )

def get_student_course_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    progress_service = Depends(get_progress_service),
    user_group = Depends(get_user_group_repository)
):
    return StudentCourseService(
        user_group,
        course_repo,
        topic_repo,
        user_topic_repo,
        progress_service
    )


def get_student_topic_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    question_repo = Depends(get_question_repository),
    progress_service = Depends(get_progress_service),
    adaptivity_service = Depends(get_adaptivity_service),
    user_group = Depends(get_user_group_repository),
    topic_attempt = Depends(get_topic_attempt_repository),
    question_attempt = Depends(get_question_attempt_repository)
):
    return StudentTopicService(
        course_repo,
        topic_repo,
        user_topic_repo,
        question_repo,
        progress_service,
        adaptivity_service,
        user_group,
        topic_attempt, 
        question_attempt
    )


def get_techer_topic_service(
    course_repo = Depends(get_course_repository),
    topic_repo = Depends(get_topic_repository),
    user_topic_repo = Depends(get_user_topic_repository),
    user_group = Depends(get_user_group_repository)
):
    return TeacherTopicService(
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
    return TeacherCourseService(
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
    question_weight = Depends(get_question_weight_repository),
    group = Depends(get_group_repo),
    weight_profile = Depends(get_weight_profile_repository)
):
    return TeacherQuestionService1(
        weight_profile,
        topic_repo, 
        question_weight,
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
    question_weight = Depends(get_question_weight_repository),
    adaptivity_profile = Depends(get_adaptivity_profile_repository)
):
    return TeacherGroupService(
        adaptivity_profile,
        group,
        course,
        question,
        question_weight
    )


def get_student_group_service(
    group = Depends(get_group_repo),
    course = Depends(get_course_repository),
    user_group = Depends(get_user_group_repository),
    topic = Depends(get_topic_repository),
    user_topic = Depends(get_user_topic_repository),
    progress_service = Depends(get_progress_service),
):
    return StudentGroupService(
        group, 
        course,
        user_group,
        topic,
        user_topic,
        progress_service
    )