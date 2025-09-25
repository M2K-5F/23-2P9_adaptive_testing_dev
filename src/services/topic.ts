import { APIUrls } from "@/config/api.constants"
import { ApiService } from "./api.service"
import { CompletedTopic, CreatedTopic, QuestionToPass, UserTopic } from "@/types/interfaces"

export const createTopic = (topic_title: string, description: string, course_id: number, score_to_pass: number) => {
    return ApiService.requestToServer(
        APIUrls.createTopicURL,
        {
            credentials: 'include',
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                title: topic_title,
                description: description,
                course_id: course_id,
                score_for_pass: score_to_pass
            })
        }
    )
}


export const archTopic = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archTopicURL,
        {
            credentials: 'include',
            method: 'put',
        },
        {
            "topic_id": topic_id
        }
    )
}


export const unarchTopic = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchTopicURL,
        {
            credentials: 'include',
            method: 'put',
        },
        {
            "topic_id": topic_id
        }
    )
}


export const getFollowedTopics = (course_id: number): Promise<UserTopic[]> => {
    return ApiService.requestToServer(
        APIUrls.getFollowedTopicsURL,
        {
            credentials: 'include',
        },
        {
            "user_course_id": course_id,
        }
    )
}


export const getTopics = (course_id: number): Promise<CreatedTopic[]> => {
    return ApiService.requestToServer(
        APIUrls.getTopicsURL,
        {
            credentials: 'include',
        },
        {
            "course_id": course_id,
        }
    )
}


export const startPassingTopic = (user_topicId: number): Promise<QuestionToPass[]> => {
    return ApiService.requestToServer(
        APIUrls.startPassingTopicURL,
        {
            credentials: 'include',
            method: 'post'
        },
        {
            'topic_id': user_topicId
        }
    )
}


export const submitTopic = (topic: CompletedTopic): Promise<{score: number}> => {
    return ApiService.requestToServer(
        APIUrls.submitTopicURL,
        {
            credentials: 'include',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(topic)
        },
    )
}