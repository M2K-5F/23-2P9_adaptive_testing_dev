import { getCourses, getFollowedCourses, getTopics } from "@/services/api.service";
import { CreatedCourse, CreatedTopic, FollowedCourse } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userStore } from "./userStore";

interface States {
    expandedCreatedCourse: number
    expandedFollowedCourse: number
}

interface Actions {
    setExpandedCreatedCourse: (id: number) => void
    setExpandedFollowedCourse: (id: number) => void
}

export const useAsideApi = create<States & Actions>()(immer((set, get) => ({
    expandedCreatedCourse: -1,
    expandedFollowedCourse: -1,

    setExpandedCreatedCourse: (id) => {
        set(draft => {
            draft.expandedFollowedCourse = -1
            console.log(id, draft.expandedCreatedCourse)
            
            if (draft.expandedCreatedCourse !== id) {
                draft.expandedCreatedCourse = id
            } else {
                draft.expandedCreatedCourse = -1
            }
        })
    },

    setExpandedFollowedCourse: (id) => {
        set(draft => {
            draft.expandedFollowedCourse = id
            draft.expandedCreatedCourse = -1
        })
    },    
})))