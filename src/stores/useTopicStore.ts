import { getTopics } from "@/services/api.service";
import { CreatedTopic } from "@/types/interfaces";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";


interface States {
    createdTopics: CreatedTopic[][]
}

interface Actions {
    fetchTopics: (courseId: number) => void
    reset: () => void
}

export const useTopicStore = create<States & Actions>()(immer((set, get) => ({
    fetchTopics: async (courseId) => {
        const topics = await getTopics(courseId) as CreatedTopic[]
        set(draft => {
            draft.createdTopics[Number(courseId)] = topics
        })
    },

    reset: () => set({createdTopics: []}),

    createdTopics: []
})))