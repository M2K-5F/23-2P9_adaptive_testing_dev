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
        APIUrls.getTeacherGroupsURL(course_id),
    )
}


export const archGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archGroupURL(group_id),
        {
            method: 'put',
        },
    )
}


export const unarchGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchGroupURL(group_id),
        {
            method: 'put',
        }
    )
}


export const getGroupWeights = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getGroupWeightsURL(group_id)
    )
}


export const getGroupsByCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getCourseGroupsURL(course_id),
    )
}


export const getFollowedGroups = () => {
    return ApiService.requestToServer(
        APIUrls.getFollowedGroupsURL,
    )
}


export const followGroup = (group_id: number, passkey: string = 'passkey') => {
    return ApiService.requestToServer(
        APIUrls.followGroupURL(group_id),
        {
            method: 'put',
            body:  JSON.stringify({passkey: passkey})
        }
    )
}


export const unfollowGroup = (group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unfollowGroupURL(group_id),
        {
            method: 'put'
        }
    )
}


export const clearGroupProgress = (user_group_id: number) => {
    return ApiService.requestToServer(
        APIUrls.clearGroupProgressURL(user_group_id),
        {
            method: 'delete',
        }
    )
}