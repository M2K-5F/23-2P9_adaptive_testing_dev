import { toast } from "sonner"
import { createTopic } from "@/services/topic"


export const useCreateTopic = () => async (courseId: number, data: {title: string, description: string, score: string}, callback: () => void, exceptionCallback: () => void) => {
    let descriptionString: string | undefined = undefined

    if (data.description.length < 3) {
        descriptionString = "Описание должно содержать минимум 3 символа"
    }

    if (data.title.length < 3) {
        descriptionString = "Название должно содержать минимум 3 символа"
    }

    if (descriptionString) {
        toast('Ошибка при создании темы:', {description: descriptionString})
        exceptionCallback()
        return
    }

        try {
            const topic = await createTopic(data.title, data.description, courseId, data.score)
            toast(`Тема с названием ${data.title} успешно созданa!`)
            callback()
        } catch (error) {
            (error as Error).message === "400" 
                ?   toast('Ошибка при создании темы:', {description: 'Тема с таким названием уже существует'})
                :   toast.error('Ошибка при создании темы:', {description: 'Неизвестная ошибка'})
            
        }
        
    }