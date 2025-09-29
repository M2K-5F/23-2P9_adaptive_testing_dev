from typing import Type, List
from models import Course, UserGroup, UserTopic, Topic
from shemas import UserOut
from ..base.base_repository import BaseRepository


class UserTopicRepository(BaseRepository[UserTopic]):
    def __init__(self):
        super().__init__(UserTopic)

    
    def create_user_topic(
        self,
        topic: Topic,
        user: UserOut,
        user_group: UserGroup,
        ready_to_pass: bool
    ) -> UserTopic:
        user_topic = self.get_or_create(
            True, defaults={},
            topic=topic,
            user=user.username,
            by_user_group = user_group,
            is_available=ready_to_pass
        )
        return user_topic

    def get_user_topics_by_user_group(self, user_group: UserGroup) -> List[UserTopic]:
        user_topics = self.select_where(by_user_group = user_group)
        user_topics.sort(key=lambda t: t.topic.number_in_course)
        return user_topics
    
    def clear_user_topic_progress(self, user_topic: UserTopic) -> UserTopic: 
        user_topic = self.update(
            user_topic,
            progress = 0,
            is_completed = 0,
            is_available = False if user_topic.topic.number_in_course else True,
            is_attempted = False
        )

        return user_topic
    
    def get_by_user_and_id(self, user: UserOut, user_topic_id: int) -> UserTopic:
        user_topic = self.get_or_none(True, id = user_topic_id, user = user.username)
        return user_topic

    
    def get_next_user_topic(self, user_topic: UserTopic):
        user_topic = (self.model
                        .select()
                        .join(Topic)
                        .where(
                            UserTopic.topic.number_in_course == user_topic.topic.number_in_course + 1, 
                            UserTopic.by_user_group == user_topic.by_user_group
                        )
                        .first()
        )
        return user_topic

    
    def get_prev_user_topic(self, user_group: UserGroup, topic: Topic) -> UserTopic:
        user_topic = (self.model
                            .select()
                            .join(Topic)
                            .where(
                                UserTopic.by_user_group == user_group, 
                                Topic.number_in_course == topic.number_in_course - 1
                            )
                            .first()
        )
        return user_topic

    
    def enable_activeness_by_course(self, course: Course) -> int:
        subquery = (
            self.model
                .select(self.model.id)
                .join(UserGroup)
                .join(Topic, on=(self.model.topic == Topic.id))
                .where(
                    self.model.by_user_group.course == course.id,
                    self.model.topic.is_active
                )
        )

        return (self.model
            .update(is_active=True)
            .where(self.model.id.in_(subquery)) # pyright: ignore
            .execute()
        )
    
    
    def disable_activeness_by_course(self, course: Course) -> int:
        subquery = (
            self.model
                .select(self.model.id)
                .join(UserGroup)
                .where(
                    self.model.by_user_group.course == course.id,
                )
        )

        return (self.model
            .update(is_active=False)
            .where(self.model.id.in_(subquery)) # pyright: ignore
            .execute()
        )
    

    def enable_activeness_by_topic(self, topic: Topic) -> int:
        subquery = (self.model
                .select(self.model.id)
                .join(UserGroup)
                .join(Course, on=(UserGroup.course == Course.id))
                .where(
                    self.model.topic == topic,
                    Course.is_active == True
                ))
    
        return (self.model
            .update(is_active=True)
            .where(self.model.id.in_(subquery)) # pyright: ignore
            .execute()
        )

    def disable_activeness_by_topic(self, topic: Topic) -> int:
        return (self.model
            .update(is_active = False)
            .where(
                self.model.topic == topic,
            )
            .execute()
        )