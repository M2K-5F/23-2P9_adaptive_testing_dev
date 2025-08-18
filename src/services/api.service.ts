
import { replace, useNavigate } from 'react-router-dom'
import {apiUrl, APIUrls} from '../config/api.constants'
import { userStore } from '../stores/userStore'
import { CreatedCourse, CreatedTopic, FetchedCourse, Form, Question, UserTopic } from '../types/interfaces'
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
            userStore.setState( state => ({...state, status: "serverunavailable"}))
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
                    userStore.setState(state => ({...state, status: 'unauthorized'}))
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


export const loginUser = (login: string, password: string) => {
    return  ApiService.requestToServer(
        APIUrls.logInURL,
        {
            method: 'POST',
            credentials: "include",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: login, password: password})
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


export const createCourse = (title: string) => {
    return ApiService.requestToServer(
        APIUrls.createCourseURL,
        {
            credentials: 'include',
            method: 'post',
        },
        {
            "course_title": title
        }
    )
}


export const getCourses = () => {
    return ApiService.requestToServer(
        APIUrls.getCoursesURL,
        {
            credentials: 'include',
        },
    )
}


export const getFollowedCourses = () => {
    return ApiService.requestToServer(
        APIUrls.getFollowedCoursesURL,
        {
            credentials: 'include',
        }
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


export const followCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.followCourseURL,
        {
            credentials: 'include',
            method: 'post'
        },
        {
            "course_id": course_id
        }
    )
}


export const unfollowCourse = (course_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unfollowCourseURL,
        {
            credentials: 'include',
            method: 'delete',
        },
        {
            "course_id": course_id,
        }
    )
}


export const createTopic = (topic_title: string, description: string, course_id: string) => {
    return ApiService.requestToServer(
        APIUrls.createTopicURL,
        {
            credentials: 'include',
            method: 'post',
        },
        {
            "topic_title": topic_title,
            "description": description,
            "course_id": course_id,
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


export const followTopic = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.followTopicURL,
        {
            credentials: 'include',
            method: 'post',
        },
        {
            "topic_id": topic_id,
        }
    )
}


export const unfollowTopic = (topic_id: number) => {
    return ApiService.requestToServer(
        APIUrls.unfollowTopicURL,
        {
            credentials: 'include',
            method: 'delete',
        },
        {
            "topic_id": topic_id
        }
    )
}


export const createQuestion = (topic_id: number, question: Question) => {
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


export const getCourse = (courseId: number): Promise<FetchedCourse> => {
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

export const addTopicToUC = (topicId: number): Promise<UserTopic> => {
    return ApiService.requestToServer(
        APIUrls.addTopicToUCURL,
        {
            method: 'post',
            credentials: 'include'
        },
        {   
            "topic_id": topicId
        }
    )
}