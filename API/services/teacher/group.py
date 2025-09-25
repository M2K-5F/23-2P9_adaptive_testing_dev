from fastapi.responses import JSONResponse
from repositories.course.course_repository import CourseRepository
from repositories.group.group import GroupRepository
from models import QuestionWeight, database
from repositories.question.question_repository import QuestionRepository
from repositories.question.question_weight import QuestionWeightRepository
from shemas import UserOut


class GroupService:
    def __init__(
        self,
        group: GroupRepository,
        course: CourseRepository,
        question: QuestionRepository,
        question_weight: QuestionWeightRepository,
    ):
        self._group = group
        self._question_weight = question_weight
        self._question = question
        self._course = course


    @database.atomic()
    def create_group(
        self,
        course_id: int,
        user: UserOut,
        title: str,
        max_count: int
    ):
        current_course = self._course.get_by_id(course_id, True)

        group =  self._group.get_or_create(
            True,
            defaults={
                "max_student_count": max_count
            },
            created_by = user.username,
            by_course = current_course,
            title = title
        )
        questions_by_course = self._question.get_questions_by_course(current_course)
        for question in questions_by_course:
            self._question_weight.get_or_create(
                True,
                group = group,
                question = question
            )
        self._course.update(
            current_course,
            group_count = current_course.group_count + 1
        )
        return JSONResponse(group.dump)


    @database.atomic()
    def get_teacher_groups(self, user: UserOut, course_id: int):
        current_course = self._course.get_by_id(course_id, True)

        groups = self._group.select_where(
            by_course = current_course,
            created_by = user.username, 
        )

        return JSONResponse([group.dump for group in groups])
    

    @database.atomic()
    def arch_group(self, user: UserOut, group_id: int):
        current_group = self._group.get_by_id(group_id, True)
        self._group.update(
            current_group,
            is_active = False
        )
        return JSONResponse(current_group.dump)

    
    @database.atomic()
    def unarch_group(self, user: UserOut, group_id: int):
        current_group = self._group.get_by_id(group_id, True)
        self._group.update(
            current_group,
            is_active = True
        )
        return JSONResponse(current_group.dump)
    

    @database.atomic()
    def get_question_weights_by_group(self, group_id: int, user: UserOut):
        current_group = self._group.get_or_none(
            True,
            id = group_id,
            created_by = user.username
        )

        weights = self._question_weight.select_where(group = current_group)
        return JSONResponse([w.dump for w in weights])
