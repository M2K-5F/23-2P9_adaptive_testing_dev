import { CreatedCourse, CreatedTopic, FollowedCourse } from "../types/interfaces"
import { userStore } from "../stores/useUserStore"
import { useMemo } from "react"


export const topicSearch = (topicList: CreatedTopic[], searchQuery: string) => {
    if (!searchQuery) return []

    const filteredTopics = topicList.filter( course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        course.created_by.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return filteredTopics
}
