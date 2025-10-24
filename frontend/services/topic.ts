import { APIUrls } from "@/config/api.constants"
import { ApiService } from "./api.service"
import { CompletedTopic, CreatedTopic, QuestionToPass, TopicToPass, UserTopic } from "@/types/interfaces"

export const createTopic = (topic_title: string, description: string, course_id: number, score_to_pass: string) => {
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
        APIUrls.archTopicURL(topic_id),
        {
            method: 'put',
        }
    )
}


export const unarchTopic = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchTopicURL(topic_id),
        {
            method: 'put',
        }
    )
}


export const getFollowedTopics = (course_id: number): Promise<UserTopic[]> => {
    return ApiService.requestToServer(
        APIUrls.getFollowedTopicsURL(course_id),
    )
}


export const getTopics = (course_id: number): Promise<CreatedTopic[]> => {
    return ApiService.requestToServer(
        APIUrls.getTopicsURL(course_id),
    )
}


export const startPassingTopic = (user_topicId: number): Promise<TopicToPass> => {
    return ApiService.requestToServer(
        APIUrls.startPassingTopicURL(user_topicId),
        {
            method: 'post'
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