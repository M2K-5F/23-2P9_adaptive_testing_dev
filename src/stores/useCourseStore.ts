import { getCourses, getFollowedCourses, getTopics } from "@/services/api.service";
import { CreatedCourse, CreatedTopic, FollowedCourse } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userStore } from "./userStore";


interface States {
    createdCourses: CreatedCourse[]
    followedCoures: FollowedCourse[]
}

interface Actions {
    fetchCourses: () => void
}

export const useCourseStore = create<States & Actions>()(immer((set, get) => ({
    createdCourses: [],
    followedCoures: [],

    fetchCourses: async () => {
        const states: {created: CreatedCourse[], followed: FollowedCourse[]} = {created: [], followed: []}
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
    }
    
})))