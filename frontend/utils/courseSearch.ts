import { CreatedCourse, FollowedCourse } from "../types/interfaces"
import { userStore } from "../stores/useUserStore"


export const courseSearch = (createdCourseList: CreatedCourse[], followedCourseList: FollowedCourse[], searchQuery: string, nick: string) => {

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
}
