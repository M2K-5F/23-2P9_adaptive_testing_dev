import {create} from 'zustand'
import { CreatedCourse, FollowedCourse } from '../../../types/interfaces'
import { userStore } from '../../../stores/userStore'
import { getCourses, getFollowedCourses } from '../../../services/api.service'
import {handleCreateCourse} from '../handlers/createCourse'

interface homeStoreShema {
    isLoading: boolean
    followedCourses: FollowedCourse[]
    createdCourses: CreatedCourse[]
    createStatus: {
        isCreating: boolean,
        isCreated: boolean,
        isOpen: boolean
    }
    init: () => void
    toggleMenu: () => void
    createCourse: () => void
}

export const useHomeStore = create<homeStoreShema>((set, get) => {
    return {
        isLoading: false,
        followedCourses: [],
        createdCourses: [],
        createStatus: {
            isCreated: false,
            isCreating: false,
            isOpen: false
        },
        init: async () => {
            set({isLoading: true})
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
            set({isLoading: false, followedCourses: states.followed, createdCourses: states.created})
        },
        toggleMenu: () => set(state => ({createStatus: {...state.createStatus, isOpen: !state.createStatus.isOpen}})),

        createCourse: async () => {

            set({createStatus: {isCreated: false, isCreating: true, isOpen: true,}, isLoading: true})
            try {
                await handleCreateCourse()
                const courses: CreatedCourse[] = await getCourses()
                set({createdCourses: courses, createStatus: {isCreated: true, isCreating: false, isOpen: false}, isLoading: false})
            } catch {
                set({createStatus: {isCreated: false, isCreating: false, isOpen: false}, isLoading: false})
            }
            
        }
    }
})