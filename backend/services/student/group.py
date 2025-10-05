from fastapi import HTTPException
from fastapi.responses import JSONResponse
from backend.utils.crypt_utils import get_password_hash, verify_password
from repositories.course.course_repository import CourseRepository
from repositories.group.group import GroupRepository
from models import Course, database
from repositories.group.user_group import UserGroupRepository
from repositories.topic.topic_repository import TopicRepository
from repositories.topic.user_topic_repository import UserTopicRepository
from services.common.progress_service import ProgressService
from shemas import GroupFollowRequest, UserOut


class GroupService:
    def __init__(
        self,
        group: GroupRepository,
        course: CourseRepository,
        user_group: UserGroupRepository,
        topic: TopicRepository,
        user_topic: UserTopicRepository,
        progress_service: ProgressService
    ):
        self._group = group
        self._progress_service = progress_service
        self._user_topic = user_topic
        self._topic = topic
        self._user_group = user_group
        self._course = course


    @database.atomic()
    def get_group_list_by_course(
        self,
        user: UserOut,
        course_id: int
    ):
        current_course = self._course.get_by_id(course_id, True)
        groups = self._group.select_where(
            by_course = current_course,
            is_active = True
        )
        user_group = self._user_group.get_user_group_by_user(
            user, current_course
        )

        id = user_group.id if user_group else 0

        return JSONResponse([
            {
                **group.dump, 
                "user_group": {**user_group.dump} if id == group.id else False  #pyright: ignore
            }
            for group in groups
        ])


    @database.atomic()
    def follow_group(
        self,
        user: UserOut,
        group_id: int,
        data: GroupFollowRequest
    ):
        current_group = self._group.get_by_id(group_id, True)
        if current_group.student_count >= current_group.max_student_count:
            raise HTTPException(
                400,
                'maximum students in group'
            )
        current_course: Course = current_group.by_course  #pyright: ignore[reportAssignmentType]

        if current_group.type == 'private' and data.passkey:
            if verify_password(data.passkey, current_group.passkey):
                pass
            else:
                raise HTTPException(400, "uncorrect passkey")


        user_group = self._user_group.get_or_create(
            True,
            course = current_group.by_course,
            user = user.username,
            group = current_group,
        )
        self._group.update(
            current_group,
            student_count = current_group.student_count + 1
        )

        
        self._course.update(
            current_course,
            student_count = current_course.student_count + 1
        )

        topics_by_course = self._topic.get_active_topics_by_course(current_course)
    
        for index, topic in enumerate(topics_by_course):
            self._user_topic.create_user_topic(
                topic, 
                user, 
                user_group,
                False if index != 0 else True
            )
        
        return JSONResponse(user_group.dump)


    @database.atomic()
    def unfollow_group(
        self,
        user: UserOut,
        group_id: int
    ):
        current_group = self._group.get_by_id(group_id, True)
        current_course: Course = current_group.by_course  # pyright: ignore[reportAssignmentType]

        user_group = self._user_group.get_or_none(
            True,
            user = user.username,
            group = current_group
        )

        self._group.update(
            current_group,
            student_count = current_group.student_count - 1
        )

        self._course.update(
            current_course,
            student_count = current_course.student_count - 1
        )


        user_group = self._progress_service.delete_user_group_associations(user_group)
        user_group.delete_instance()
        
        return JSONResponse(user_group.dump)
    
    

    @database.atomic()
    def get_user_groups_by_user(self, user: UserOut):
        user_groups = self._user_group.select_where(user = user.username)
        return JSONResponse([ug.dump for ug in user_groups])