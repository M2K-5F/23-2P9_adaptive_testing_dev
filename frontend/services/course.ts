import { APIUrls } from "@/config/api.constants"
import { ApiService } from "./api.service"
import { FetchedCourse } from "@/types/interfaces"

export const createCourse = (title: string, description: string) => {
    return ApiService.requestToServer(
        APIUrls.createCourseURL,
        {
            credentials: 'include',
            method: 'post',
        },
        {
            "course_title": title,
            "course_description": description
        }
    )
}


export const getCreatedCourses = () => {
    return ApiService.requestToServer(
        APIUrls.getCreatedCoursesURL,
        {
            credentials: 'include',
        },
    )
}


export const archCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archCourseURL,
        {
            credentials: 'include',
            method: 'put',
        },
        {
            "course_id": course_id
        }
    )
}


export const unarchCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchCourseURL,
        {
            credentials: 'include',
            method: 'put',
        },
        {
            "course_id": course_id
        }
    )
}



export const getCourseById = (courseId: number): Promise<FetchedCourse> => {
    return ApiService.requestToServer(
        APIUrls.getCourseURL,
        {
            credentials: 'include'
        },
        {
            'course_id': courseId
        }
    )
}