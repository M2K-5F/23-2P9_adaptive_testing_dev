import { APIUrls } from "@/config/api.constants"
import { ApiService } from "./api.service"
import { FetchedCourse } from "@/types/interfaces"

export const createCourse = (title: string, description: string) => {
    return ApiService.requestToServer(
        APIUrls.createCourseURL,
        {
            method: 'post',
            body: JSON.stringify({title: title, description: description}),
            headers: {
                "Content-type": "application/json"
            },
        },
    )
}


export const getCreatedCourses = () => {
    return ApiService.requestToServer(
        APIUrls.getCreatedCoursesURL,
    )
}


export const archCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archCourseURL(course_id),
        {
            method: 'put',
        },
    )
}


export const unarchCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchCourseURL(course_id),
        {
            method: 'put',
        }
    )
}



export const getCourseById = (courseId: number): Promise<FetchedCourse> => {
    return ApiService.requestToServer(
        APIUrls.getCourseURL(courseId),
        {
            credentials: 'include'
        },
    )
}