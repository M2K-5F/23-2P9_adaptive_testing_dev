
import { replace, useNavigate } from 'react-router-dom'
import {apiUrl, APIUrls} from '../config/api.constants'
import { useUserStore } from '../stores/useUserStore'
import { CompletedTopic, CourseStats, CreatedCourse, CreatedTopic, FetchedCourse, QuestionCreate, QuestionToPass, UserShema, UserTopic } from '../types/interfaces'
import axios from 'axios'

class ApiServiceClass {
    private navigate: ReturnType<typeof useNavigate> | null = null

    setNavigate = (navigate: ReturnType<typeof useNavigate>) => {
        this.navigate = navigate
    }

    useNavigate = (path: string, replace: boolean = false): void => {
        this.navigate ? this.navigate(path, {replace: replace}) : console.log('еще не инициализирован')
    }

    requestToServer = (URL: apiUrl, init?: RequestInit, queries?: object, ignoreUnautorize: boolean = false, ignoreForbidden: boolean = false,) => {
        let queryString = ''

        if (queries) {
            Object.entries(queries).map(query => queryString += `${query[0]}=${query[1]}&`)
        }

        return fetch(`${URL}?${queryString}`, init)
        .catch(() => {
            useUserStore.setState( state => ({...state, status: "serverunavailable"}))
            throw Error('503')
        })
        .then((response) => {
            if (response.ok) {
                return response.json()
            }
            else {
                if (response.status === 403 && !ignoreForbidden) {
                    this.useNavigate('/403', true)
                    throw Error
                }
                if (response.status === 401 && !ignoreUnautorize) {
                    useUserStore.setState(state => ({...state, status: 'unauthorized'}))
                    throw Error
                }
                throw Error(String(response.status))
            }
        })
    }
}

export const ApiService = new ApiServiceClass()


export const logoutUser = async () => {
    return fetch(
        APIUrls.logOutURL,
        {
            method: 'post',
            credentials: 'include',
        }
    )
}


export const loginUser = (login: string, password: string, is_remember: boolean): Promise<UserShema> => {
    return  ApiService.requestToServer(
        APIUrls.logInURL,
        {
            method: 'POST',
            credentials: "include",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: login, password: password, is_remember: is_remember})
        },
        undefined,
        true
    )
}


export const registerUser = async (body: string) => {
    return ApiService.requestToServer(
        APIUrls.registerURL,
        {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: body
        },
    )
}

export const searchCourses = (searchQuery: string) => {
    return ApiService.requestToServer(
        APIUrls.searchCourseURL,
        {
            credentials: 'include'
        },
        {
            "q": searchQuery
        }
    )
}


export const getCourseStats = (courseId: number): Promise<CourseStats> => {
    return ApiService.requestToServer(
        APIUrls.getCourseStatsURL,
        {
            credentials: 'include',
        },
        {
            "course_id": courseId
        }
    )
}
