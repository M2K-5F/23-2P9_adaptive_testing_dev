from typing import Type, List
from models import Topic, Course, UserCourse, UserTopic
from ..base.base_repository import BaseRepository

class TopicRepository(BaseRepository[Topic]):
    def __init__(self):
        super().__init__(Topic)

    
    def get_active_topics_by_course(self, course: Course) -> List[Topic]:
        active_topics = self.select_where(by_course = course, is_active=True)
        active_topics.sort(key=lambda t: t.number_in_course)  # pyright: ignore
        return active_topics
    
    