import {create} from 'zustand'
import { CreatedTopic } from '../../../../types/interfaces'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createTopic, getTopics } from '../../../../services/api.service'

interface editCourseStore {
    createdTopics: CreatedTopic[]
    createdStatus: {
        isMenuOpen: boolean
        isCreating: boolean
        isCreated: boolean
    }
    isError: boolean
    expandedTopic: number
    isLoading: boolean
    createTopic: (title: string, description: string, courseId: string) => Promise<void>
    fetchTopics: (courseId: string) => Promise<void>
    toggleIsMenuOpen: () => void
    setExpandedTopic: (topicId: number) => void
}

export const useEditCourseStore = create<editCourseStore>((set, get) => {
    return {
        createdTopics: [],
        createdStatus: {
            isCreating: false,
            isMenuOpen: false,
            isCreated: false,
        },
        isError: false,
        expandedTopic: -1,
        isLoading: false,

        fetchTopics: async (courseId: string) => {
            set({isLoading: true})
            try {
                const topics = await getTopics(Number(courseId))
                set({createdTopics: topics, isLoading: false})
            } catch {
                set({isError: true, isLoading: true})
                throw Error('Error with fetching topics')
            }
        },

        createTopic: async (title: string, description: string, courseId: string) => {
            set(state => ({createdStatus: {...state.createdStatus, isCreating: true}}))
            try {
                await createTopic(title, description, courseId)
                const topics = await getTopics(Number(courseId))
                set({createdTopics: topics, createdStatus: {isCreating: false, isMenuOpen: false, isCreated: true}})
            } 
            catch (error) {
                set({createdStatus: {isCreating: false, isMenuOpen: true, isCreated: false}})
                if (error.message === '400') throw Error('400')
                throw Error('error with create topic')
            }
        },

        setExpandedTopic: (topicId: number) => {
            set({expandedTopic: topicId})
        },

        toggleIsMenuOpen: () => set(state => ({
            createdStatus: {
                ...state.createdStatus, 
                isMenuOpen: !state.createdStatus.isMenuOpen
            }
        }))
    }
})

