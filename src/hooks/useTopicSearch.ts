import { CreatedCourse, CreatedTopic, FollowedCourse } from "../types/interfaces"
import { userStore } from "../stores/userStore"
import { useMemo } from "react"


export const useTopicSearch = (topicList: CreatedTopic[], searchQuery: string) => {
    return useMemo( () => {
        if (!searchQuery) return []

        const filteredTopics = topicList.filter( course => 
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            course.created_by.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return filteredTopics
    }, [topicList, searchQuery])
}
