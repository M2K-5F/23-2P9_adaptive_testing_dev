import { toast } from "sonner"
import { createTopic } from "@/services/api.service"


export const useCreateTopic = () => async (courseId: number, titleId: string, descriptionId: string, callback: () => void, exceptionCallback: () => void) => {
    const titleInput = document.getElementById(titleId) as HTMLInputElement
    const descInput = document.getElementById(descriptionId) as HTMLInputElement
    const title = titleInput.value.trim()
    const description = descInput.value.trim()
    let descriptionString: string | undefined = undefined

    if (description.length < 3) {
        descriptionString = "Описание должно содержать минимум 3 символа"
    }

    if (title.length < 3) {
        descriptionString = "Название должно содержать минимум 3 символа"
    }

    if (descriptionString) {
        toast('Ошибка при создании темы:', {description: descriptionString})
        exceptionCallback()
        return
    }

        try {
            const topic = await createTopic(title, description, String(courseId))
            toast(`Тема с названием ${title} успешно созданa!`)
            callback()
        } catch (error) {
            (error as Error).message === "400" 
                ?   toast('Ошибка при создании темы:', {description: 'Тема с таким названием уже существует'})
                :   toast.error('Ошибка при создании темы:', {description: 'Неизвестная ошибка'})
            
        }
        
    }