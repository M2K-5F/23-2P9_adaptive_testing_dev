import { getCourses, getFollowedCourses, getTopics } from "@/services/api.service";
import { CreatedCourse, CreatedTopic, FollowedCourse } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userStore } from "./userStore";

interface States {
    expandedCreatedCourse: number
    expandedFollowedCourse: number
    expandedCreatedTopic: number
}

interface Actions {
    setExpandedTopic: (topicId: number) => void
    setExpandedCreatedCourse: (id: number) => void
    setExpandedFollowedCourse: (id: number) => void
}

export const useAsideApi = create<States & Actions>()(immer((set, get) => ({
    expandedCreatedCourse: -1,
    expandedFollowedCourse: -1,
    expandedCreatedTopic: -1,

    setExpandedCreatedCourse: (id) => {
        set(draft => {
            if (draft.expandedCreatedCourse !== id) {
                draft.expandedCreatedCourse = id
            }
        })
    },

    setExpandedFollowedCourse: (id) => {
        set(draft => {
            draft.expandedFollowedCourse = id
            draft.expandedCreatedCourse = -1
        })
    },

    setExpandedTopic: (topicId) => {
        set(draft => {
            if (draft.expandedCreatedTopic != topicId) {
                draft.expandedCreatedTopic = topicId
            } else {
                draft.expandedCreatedTopic = -1
            }
        })
    }
})))