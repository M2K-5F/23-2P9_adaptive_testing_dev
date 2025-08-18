const host = 'http://26.94.89.32' as const;
const port = '8001' as const;

export const URL = `${host}:${port}` as const;
export const tURL = `${URL}/t` as const;
export const sURL = `${URL}/s` as const;

const searchUrl = `${URL}/search` as const;

export const APIUrls = {
    usersMeURL: `${URL}/auth/users/me`,
    logInURL: `${URL}/auth/login`,
    logOutURL: `${URL}/auth/logout`,
    registerURL: `${URL}/auth/register`,

    createCourseURL: `${tURL}/course/create`,
    getCoursesURL: `${tURL}/course/get`,
    getFollowedCoursesURL: `${sURL}/course/get_followed`,
    archCourseURL: `${tURL}/course/arch`,
    followCourseURL: `${sURL}/course/follow`,
    unfollowCourseURL: `${sURL}/course/unfollow`,
    getCourseURL: `${sURL}/course/get_by_id`,

    createTopicURL: `${tURL}/topic/create`,
    addTopicToUCURL: `${sURL}/topic/add_topic_to_user_course`,
    getTopicsURL: `${sURL}/topic/get`,
    getFollowedTopicsURL: `${sURL}/topic/get_followed`,
    archTopicURL: `${tURL}/topic/arch`,
    followTopicURL: `${sURL}/topic/follow`,
    unfollowTopicURL: `${sURL}/topic/unfollow`,

    createQuestionURL: `${tURL}/question/create`,
    getQuestionsURL: `${tURL}/question/get`,
    archQuestionURL: `${tURL}/question/arch`,

    searchCourseURL: `${searchUrl}/course`
} as const;

export type apiUrl = {
    [K in keyof typeof APIUrls]:
        typeof APIUrls[K] extends (pollID: number) => any ? ReturnType<typeof APIUrls[K]> : typeof APIUrls[K]
}[keyof typeof APIUrls];