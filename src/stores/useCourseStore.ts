import { getCourses, getFollowedCourses, getTopics } from "@/services/api.service";
import { CreatedCourse, UserCourse } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useUserStore } from "./useUserStore";


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
        const roles = useUserStore.getState().roles
        if (roles.includes('student')) {
            try {
                states.followed = await getFollowedCourses()
            } catch {}
        }
        if (roles.includes('teacher')) {
            try {
                states.created = await getCourses()
            } catch {}
            
        }
        set(draft => {
            draft.createdCourses = states.created       
            draft.followedCoures = states.followed
        })    
        return
    },
    fetchFollowedCourses: async () => {
        let followed: UserCourse[];
        try {
            followed = await getFollowedCourses()
        } catch {}
        set(d => {d.followedCoures = followed})
        return
    }
    
})))