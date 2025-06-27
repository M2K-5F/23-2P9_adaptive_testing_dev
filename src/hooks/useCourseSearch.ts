import { CreatedCourse, FollowedCourse } from "../types/interfaces"
import { userStore } from "../stores/userStore"
import { useMemo } from "react"


export const useCourseSearch = (createdCourseList: CreatedCourse[], followedCourseList: FollowedCourse[], searchQuery: string) => {
    const {nick} = userStore()

    return useMemo( () => {
        if (!searchQuery) return []

        const filteredCreatedCourses = createdCourseList.filter( course => 
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            course.created_by.toLowerCase().includes(searchQuery.toLowerCase())
        )

        const filteredFollowedCourses = (followedCourseList.filter( userCourse => (
                userCourse.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                userCourse.course.created_by.toLowerCase().includes(searchQuery.toLowerCase())
            ) && userCourse.course.created_by !== nick
        )).map( userCourse => userCourse.course)
        

        return [...filteredCreatedCourses, ...filteredFollowedCourses]
    }, [createdCourseList, followedCourseList, searchQuery])
}
