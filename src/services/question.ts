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
            body: JSON.stringify(question),
        },
        {   
            "topic_id": topic_id,
        }
    )
}


export const getQuestions = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.getQuestionsURL,
        {
            credentials: 'include',
        },
        {
            "topic_id": topic_id
        }
    )
}


export const archQuestion = (question_id: number) => {
    return ApiService.requestToServer(
        APIUrls.archQuestionURL,
        {
            credentials: 'include',
            method: "put",
        },
        {
            "question_id": question_id
        }
    )
}


export const unarchQuestion = (question_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unarchQuestionURL,
        {
            credentials: 'include',
            method: "put",
        },
        {
            "question_id": question_id
        }
    )
}


export const submitQuestion = (user_answer_id: number, score: number) => {
    return ApiService.requestToServer(
        APIUrls.submitQuestionURL,
        {
            credentials: 'include',
            method: 'post'
        },
        {
            'user_answer_id': user_answer_id,
            "score": score
        }
    )
}