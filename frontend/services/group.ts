import { APIUrls } from "@/config/api.constants"
import { ApiService } from "./api.service"
import { GroupCreate } from "@/types/interfaces"

export const createGroup = (create_data: GroupCreate) => {
    return ApiService.requestToServer(
        APIUrls.createGroupURL,
        {
            credentials: 'include',
            method: 'post',
            body: JSON.stringify(create_data),
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }
    )
}


export const getCreatedGroups = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getTeacherGroupsURL,
        {
            credentials: 'include',
        },
        {
            course_id: course_id
        }
    )
}


export const archGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archGroupURL,
        {
            method: 'put',
            credentials: 'include',
        },
        {
            group_id: group_id
        }
    )
}


export const unarchGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchGroupURL,
        {
            method: 'put',
            credentials: 'include',
        },
        {
            group_id: group_id
        }
    )
}


export const getGroupWeights = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getGroupWeightsURL,
        {
            credentials: 'include',
        },
        {
            group_id: group_id
        }
    )
}


export const getGroupsByCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getCourseGroupsURL,
        {
            credentials: 'include',
        },
        {
            course_id: course_id
        }
    )
}


export const getFollowedGroups = () => {
    return ApiService.requestToServer(
        APIUrls.getFollowedGroupsURL,
        {
            credentials: 'include',
        },
    )
}


export const followGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.followGroupURL,
        {
            credentials: 'include',
            method: 'put'
        },
        {
            group_id: group_id
        }
    )
}


export const unfollowGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unfollowGroupURL,
        {
            credentials: 'include',
            method: 'put'
        },
        {
            group_id: group_id
        }
    )
}


export const clearGroupProgress = (user_group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.clearGroupPregressURL,
        {
            method: 'delete',
            credentials: 'include',
        },
        {
            user_group_id: user_group_id
        }
    )
}