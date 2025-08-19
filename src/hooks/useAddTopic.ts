import { addTopicToUC } from "@/services/api.service"
import { useTopicStore } from "@/stores/useTopicStore"
import { CreatedTopic } from "@/types/interfaces"
import { toast } from "sonner"

export const useAddTopicToUC = () => {
    const fetchFollowedTopics = useTopicStore(s => s.fetchFollowedTopics)
    
    return async (topic: CreatedTopic) => {
        try {
            const ut = await addTopicToUC(topic.id)
            fetchFollowedTopics(ut.by_user_course.id)
            toast('Новая тема успешно добавлена в курс!')
        } catch {
            toast("Ошибка! Попробуйте позднее")
        }
    }
}