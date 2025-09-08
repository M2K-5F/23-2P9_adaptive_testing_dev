from typing import Type, List
from db import UserCourse, UserTopic, Topic
from shemas import UserOut
from ..base.base_repository import BaseRepository


class UserTopicRepository(BaseRepository[UserTopic]):
    def __init__(self):
        super().__init__(UserTopic)

    
    def create_user_topic(
        self,
        topic: Topic,
        username: str,
        user_course: UserCourse,
        ready_to_pass: bool
    ) -> UserTopic:
        user_topic = self.get_or_create(
            True, defaults={},
            topic=topic,
            user=username,
            by_user_course=user_course,
            ready_to_pass=ready_to_pass
        )
        return user_topic

    def get_user_topics_by_user_course(self, user_course: UserCourse) -> List[UserTopic]:
        user_topics = self.select_where(by_user_course = user_course)
        user_topics.sort(key=lambda t: t.topic.number_in_course)
        return user_topics
    
    def clear_user_topic_progress(self, user_topic: UserTopic) -> UserTopic: 
        user_topic.topic_progress = 0 
        user_topic.is_completed = 0
        user_topic.ready_to_pass = False if user_topic.topic.number_in_course else True
        user_topic.save()
        return user_topic
    
    def get_by_user_and_id(self, user: UserOut, user_topic_id: int) -> UserTopic:
        user_topic = self.get_or_none(True, id = user_topic_id, user = user.username)
        return user_topic

    
    def get_next_user_topic(self, user_topic: UserTopic):
        user_topic = (UserTopic
                        .select()
                        .join(Topic)
                        .where(
                            UserTopic.topic.number_in_course == user_topic.topic.number_in_course + 1, 
                            UserTopic.by_user_course == user_topic.by_user_course
                        )
                        .first()
        )
        return user_topic

    
    def get_prev_user_topic(self, user_course: UserCourse, topic: Topic) -> UserTopic:
        user_topic = (UserTopic
                            .select()
                            .join(Topic)
                            .where(
                                UserTopic.by_user_course == user_course, 
                                Topic.number_in_course == topic.number_in_course - 1
                            )
                            .first()
        )
        return user_topic