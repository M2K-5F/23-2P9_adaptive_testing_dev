export const baseURL = `http://localhost/api` as const;
// export const baseURL = `http://109.161.15.144/api`
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
    archCourseURL: (course_id: number) => `${tURL}/course/${course_id}/arch`,
    unarchCourseURL: (course_id: number) => `${tURL}/course/${course_id}/unarch`,
    getCourseStatsURL: (course_id: number) => `${tURL}/course/${course_id}/stats`,

    // Student/Course
    getCourseURL: (course_id: number) => `${sURL}/course/${course_id}/get_by_id`,

    // Teacher/Topic
    createTopicURL: `${tURL}/topic/create`,
    archTopicURL: (topic_id: number) => `${tURL}/topic/${topic_id}/arch`,
    unarchTopicURL: (topic_id: number) => `${tURL}/topic/${topic_id}/unarch`,

    // Student/Topic
    getTopicsURL: (course_id: number) => `${sURL}/topic/${course_id}/get`,
    getFollowedTopicsURL: (user_group_id: number) => `${sURL}/topic/${user_group_id}/get_followed`,
    startPassingTopicURL: (topic_id: number) => `${sURL}/topic/${topic_id}/start`,
    submitTopicURL: `${sURL}/topic/submit_topic`,

    // Teacher/Questions
    createQuestionURL: `${tURL}/question/create`,
    getQuestionsURL: (topic_id: number) => `${tURL}/question/${topic_id}/get`,
    archQuestionURL: (question_id: number) => `${tURL}/question/${question_id}/arch`,
    unarchQuestionURL: (question_id: number) => `${tURL}/question/${question_id}/unarch`,
    submitQuestionURL: (user_answer_id: number) => `${tURL}/question/${user_answer_id}/submit`,

    searchCourseURL: `${searchUrl}/course`,

    // Teacher/Group
    createGroupURL: `${tURL}/group/create`,
    getTeacherGroupsURL: (course_id: number) => `${tURL}/group/${course_id}/get`,
    archGroupURL: (group_id: number) => `${tURL}/group/${group_id}/arch`,
    unarchGroupURL: (group_id: number) => `${tURL}/group/${group_id}/unarch`,
    getGroupWeightsURL: (group_id: number) => `${tURL}/group/${group_id}/weights`,

    // Student/Group
    getCourseGroupsURL: (course_id: number) => `${sURL}/group/${course_id}/get`,
    getFollowedGroupsURL: `${sURL}/group/get_followed`,
    followGroupURL: (group_id: number) => `${sURL}/group/${group_id}/follow`,
    unfollowGroupURL: (group_id: number) => `${sURL}/group/${group_id}/unfollow`,
    clearGroupProgressURL: (user_group_id: number) => `${sURL}/group/${user_group_id}/clear`
} as const

export type apiUrl = {
    [K in keyof typeof APIUrls]:
        typeof APIUrls[K] extends (...args: any[]) => any ? ReturnType<typeof APIUrls[K]> : typeof APIUrls[K]
}[keyof typeof APIUrls]