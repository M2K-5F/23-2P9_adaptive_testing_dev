import {create} from 'zustand'
import { CreatedCourse, CreatedTopic, FetchedTopic } from '../../../types/interfaces'
import { followCourse, getCourse, getTopics, unfollowCourse } from '../../../services/api.service'

interface CourseViewStoreShema {
    isLoading: boolean
    topics: FetchedTopic[]
    course: CreatedCourse | undefined
    isFollowed: boolean
    isFollowError: boolean

    getData: (courseId: string) => void
    followHandler: (courseID: string) => void
}

export const useCourseViewStore = create<CourseViewStoreShema>((set, get) => ({
    isFollowed: false,
    isLoading: false,
    course: undefined,
    topics: [],
    isFollowError: false,

    getData: async (courseId: string) => {
        set({isLoading: true})
        const [topics, course] = await Promise.allSettled([getTopics(Number(courseId)), getCourse(courseId)])
        let topicsData: FetchedTopic[],
            courseData: CreatedCourse | undefined,
            isFollowed: boolean;

        if (topics.status === 'rejected') {
            topicsData = []
        } else {
            topicsData = topics.value
        }

        if (course.status === 'rejected') {
            courseData = undefined
            isFollowed = false
        } else {
            courseData = course.value.course_data
            isFollowed = course.value.isFollowed
        }

        set({isFollowed: isFollowed, isLoading: false, course: courseData, topics: topicsData})
    },

    followHandler: async (courseId: string) => {
        set({isLoading: true, isFollowError: false})
        const isFollowed = get().isFollowed
        if (isFollowed) {
            try {
                const response = await unfollowCourse(Number(courseId))
            }
            catch {
                set({isFollowed: true, isFollowError: true})
            }
        } else {
            try {
                const response = await followCourse(Number(courseId))
                set({isFollowed: true})
            }
            catch {
                set({isFollowed: false, isFollowError: true})
            }
        }
        set({isLoading: false})
    }
}))