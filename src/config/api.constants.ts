const host = 'http://localhost' as const
const port = '8001' as const 

export const URL = `${host}:${port}` as const

const courseUrl = `${URL}/course` as const
const topicUrl = `${URL}/topic` as const
const questionUrl = `${URL}/question` as const
const searchUrl = `${URL}/search` as const 

export const APIUrls = {
    usersMeURL: `${URL}/auth/users/me`,//
    logInURL: `${URL}/auth/login`,//
    logOutURL: `${URL}/auth/logout`,//
    registerURL: `${URL}/auth/register`,//

    createCourseURL: `${courseUrl}/create`,
    getCoursesURL: `${courseUrl}/get`,
    getFollowedCoursesURL: `${courseUrl}/get_followed`,
    archCourseURL: `${courseUrl}/arch`,
    followCourseURL: `${courseUrl}/follow`,
    unfollowCourseURL: `${courseUrl}/unfollow`,
    getCourseURL: `${courseUrl}/get_by_id`,

    createTopicURL: `${topicUrl}/create`,
    getTopicsURL: `${topicUrl}/get`,
    getFollowedTopicsURL: `${topicUrl}/get_followed`,
    archTopicURL: `${topicUrl}/arch`,
    followTopicURL: `${topicUrl}/follow`,
    unfollowTopicURL: `${topicUrl}/unfollow`,

    createQuestionURL: `${questionUrl}/create`,
    getQuestionsURL: `${questionUrl}/get`,
    archQuestionURL: `${questionUrl}/arch`,

    searchCourseURL: `${searchUrl}/course`
} as const


export type apiUrl = {
    [K in keyof typeof APIUrls]:
        typeof APIUrls[K] extends (pollID: number) => any ? ReturnType<typeof APIUrls[K]> : typeof APIUrls[K]
}[keyof typeof APIUrls]
