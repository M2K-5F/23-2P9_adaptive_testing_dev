import { APIUrls } from "@/config/api.constants"
import { ApiService } from "./api.service"
import { QuestionCreate } from "@/types/interfaces"

export const createQuestion = (topic_id: number, question: QuestionCreate) => {
    return ApiService.requestToServer(
        APIUrls.createQuestionURL,
        {
            credentials: 'include',
            method: "post",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...question, topic_id: topic_id}),
        }
    )
}


export const getQuestions = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getQuestionsURL(topic_id)
    )
}


export const archQuestion = (question_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archQuestionURL(question_id),
        {
            method: "put",
        }
    )
}


export const unarchQuestion = (question_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchQuestionURL(question_id),
        {
            method: "put",
        }
    )
}


export const submitQuestion = (user_answer_id: number, score: number) => {
    return ApiService.requestToServer(
        APIUrls.submitQuestionURL(user_answer_id),
        {
            method: 'post'
        },
        {
            "score": score
        }
    )
}