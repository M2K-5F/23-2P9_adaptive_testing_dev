import { getCourses, getFollowedCourses, getTopics } from "@/services/api.service";
import { CreatedCourse, UserCourse } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userStore } from "./userStore";


interface States {
    createdCourses: CreatedCourse[]
    followedCoures: UserCourse[]
}

interface Actions {
    fetchCourses: () => void
    fetchFollowedCourses: () => void
}

export const useCourseStore = create<States & Actions>()(immer((set, get) => ({
    createdCourses: [],
    followedCoures: [],

    fetchCourses: async () => {
        const states: {created: CreatedCourse[], followed: UserCourse[]} = {created: [], followed: []}
        const role = userStore.getState().role
        if (role.includes('student')) {
            try {
                states.followed = await getFollowedCourses()
            } catch {}
        }
        if (role.includes('teacher')) {
            try {
                states.created = await getCourses()
            } catch {}
            
        }
        set(draft => {
            draft.createdCourses = states.created       
            draft.followedCoures = states.followed
        })    
    },
    fetchFollowedCourses: async () => {
        let followed: UserCourse[];
        try {
            followed = await getFollowedCourses()
        } catch {}
        set(d => {d.followedCoures = followed})
    }
    
})))