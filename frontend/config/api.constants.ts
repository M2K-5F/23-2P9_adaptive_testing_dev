export const baseURL = `http://localhost/api` as const;
export const tURL = `${baseURL}/t` as const;
export const sURL = `${baseURL}/s` as const;

const searchUrl = `${baseURL}/search` as const;

export const APIUrls = {
    usersMeURL: `${baseURL}/auth/users/me`,
    logInURL: `${baseURL}/auth/login`,
    logOutURL: `${baseURL}/auth/logout`,
    registerURL: `${baseURL}/auth/register`,

    // Teacher/Course
    createCourseURL: `${tURL}/course/create`,
    getCreatedCoursesURL: `${tURL}/course/get`,
    archCourseURL: `${tURL}/course/arch`,
    unarchCourseURL: `${tURL}/course/unarch`,
    getCourseStatsURL: `${tURL}/course/stats`,

    // Student/Course
    getCourseURL: `${sURL}/course/get_by_id`,

    // Teacher/Topic
    createTopicURL: `${tURL}/topic/create`,
    archTopicURL: `${tURL}/topic/arch`,
    unarchTopicURL: `${tURL}/topic/unarch`,

    //Student/Topic
    getTopicsURL: `${sURL}/topic/get`,
    getFollowedTopicsURL: `${sURL}/topic/get_followed`,
    startPassingTopicURL: `${sURL}/topic/start`,
    submitTopicURL: `${sURL}/topic/submit_topic`,

    //Teacher/Questions
    createQuestionURL: `${tURL}/question/create`,
    getQuestionsURL: `${tURL}/question/get`,
    archQuestionURL: `${tURL}/question/arch`,
    unarchQuestionURL: `${tURL}/question/unarch`,
    submitQuestionURL: `${tURL}/question/submit`,

    searchCourseURL: `${searchUrl}/course`,

    //Teacher/Group
    createGroupURL: `${tURL}/group/create`,
    getTeacherGroupsURL: `${tURL}/group/get`,
    archGroupURL: `${tURL}/group/arch`,
    unarchGroupURL: `${tURL}/group/unarch`,
    getGroupWeightsURL: `${tURL}/group/weights`,

    //Student/Group
    getCourseGroupsURL: `${sURL}/group/get`,
    getFollowedGroupsURL: `${sURL}/group/get_followed`,
    followGroupURL: `${sURL}/group/follow`,
    unfollowGroupURL: `${sURL}/group/unfollow`,
    clearGroupPregressURL: `${sURL}/group/clear`
} as const

export type apiUrl = {
    [K in keyof typeof APIUrls]:
        typeof APIUrls[K] extends (pollID: number) => any ? ReturnType<typeof APIUrls[K]> : typeof APIUrls[K]
}[keyof typeof APIUrls]