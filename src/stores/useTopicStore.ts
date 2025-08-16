import { getFollowedTopics, getTopics } from "@/services/api.service";
import { CreatedTopic, UserTopic } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";


interface States {
    createdTopics: CreatedTopic[][]
    followedTopics: UserTopic[][]
}

interface Actions {
    fetchCreatedTopics: (courseId: number) => void
    fetchFollowedTopics: (courseId: number) => void
    reset: () => void
}

export const useTopicStore = create<States & Actions>()(immer((set, get) => ({
    createdTopics: [],
    followedTopics: [],

    fetchCreatedTopics: async (courseId) => {
        const topics = await getTopics(courseId)
        set(draft => {
            draft.createdTopics[Number(courseId)] = topics
        })
    },

    fetchFollowedTopics: async (courseId) => {
        try {
            const topics = await getFollowedTopics(courseId)
            set(draft => {
                draft.followedTopics[courseId] = topics
            })
        } catch {
            set(d => {d.followedTopics[courseId] = []})
        }
    },

    reset: () => set({createdTopics: []}),
})))