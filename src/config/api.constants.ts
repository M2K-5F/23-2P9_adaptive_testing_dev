export const baseURL = `http://localhost/api` as const;
export const tURL = `${baseURL}/t` as const;
export const sURL = `${baseURL}/s` as const;

const searchUrl = `${baseURL}/search` as const;

export const APIUrls = {
    usersMeURL: `${baseURL}/auth/users/me`,
    logInURL: `${baseURL}/auth/login`,
    logOutURL: `${baseURL}/auth/logout`,
    registerURL: `${baseURL}/auth/register`,

    createCourseURL: `${tURL}/course/create`,
    getCoursesURL: `${tURL}/course/get`,
    getFollowedCoursesURL: `${sURL}/course/get_followed`,
    archCourseURL: `${tURL}/course/arch`,
    unarchCourseURL: `${tURL}/course/unarch`,
    followCourseURL: `${sURL}/course/follow`,
    unfollowCourseURL: `${sURL}/course/unfollow`,
    getCourseURL: `${sURL}/course/get_by_id`,
    clearUCUrl: `${sURL}/course/clear`,
    getCourseStatsURL: `${tURL}/course/stats`,

    createTopicURL: `${tURL}/topic/create`,
    addTopicToUCURL: `${sURL}/topic/add_topic_to_user_course`,
    getTopicsURL: `${sURL}/topic/get`,
    getFollowedTopicsURL: `${sURL}/topic/get_followed`,
    archTopicURL: `${tURL}/topic/arch`,
    unarchTopicURL: `${tURL}/topic/unarch`,
    followTopicURL: `${sURL}/topic/follow`,
    unfollowTopicURL: `${sURL}/topic/unfollow`,
    startPassingTopicURL: `${sURL}/topic/start`,
    submitTopicURL: `${sURL}/topic/submit_topic`,

    createQuestionURL: `${tURL}/question/create`,
    getQuestionsURL: `${tURL}/question/get`,
    archQuestionURL: `${tURL}/question/arch`,
    unarchQuestionURL: `${tURL}/question/unarch`,
    submitQuestionURL: `${tURL}/question/submit`,

    searchCourseURL: `${searchUrl}/course`,
} as const

export type apiUrl = {
    [K in keyof typeof APIUrls]:
        typeof APIUrls[K] extends (pollID: number) => any ? ReturnType<typeof APIUrls[K]> : typeof APIUrls[K]
}[keyof typeof APIUrls]