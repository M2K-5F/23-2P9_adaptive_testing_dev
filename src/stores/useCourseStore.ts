import { getCreatedCourses, } from "@/services/course";
import { getFollowedGroups } from "@/services/group";
import { CreatedCourse, UserGroup } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useUserStore } from "./useUserStore";


interface States {
    createdCourses: CreatedCourse[]
    followedCoures: UserGroup[]
}

interface Actions {
    fetchCourses: () => void
    fetchFollowedCourses: () => void
}

export const useCourseStore = create<States & Actions>()(immer((set, get) => ({
    createdCourses: [],
    followedCoures: [],

    fetchCourses: async () => {
        const states: {created: CreatedCourse[], followed: UserGroup[]} = {created: [], followed: []}
        const roles = useUserStore.getState().roles
        if (roles.includes('student')) {
            try {
                states.followed = await getFollowedGroups()
            } catch {}
        }
        if (roles.includes('teacher')) {
            try {
                states.created = await getCreatedCourses()
            } catch {}
            
        }
        set(draft => {
            draft.createdCourses = states.created       
            draft.followedCoures = states.followed
        })    
        return
    },

    fetchFollowedCourses: async () => {
        let followed: UserGroup[];
        try {
            followed = await getFollowedGroups()
        } catch {}
        set(d => {d.followedCoures = followed})
        return
    }
})))