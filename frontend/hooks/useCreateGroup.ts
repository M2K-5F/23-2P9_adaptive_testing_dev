import { toast } from "sonner"
import { createTopic } from "@/services/topic"
import { createGroup } from "@/services/group"
import { GroupCreate } from "@/types/interfaces"


export const useCreateGroup = () => async (data: GroupCreate, callback: () => void, exceptionCallback: () => void) => {
    let descriptionString: string | undefined = undefined

    if (data.title.length < 3) {
        descriptionString = "Название должно содержать минимум 3 символа"
    }

    if (data.max_student_count < 5 || data.max_student_count > 30) {
        descriptionString = "Некорректное количество студентов"
    }

    if (descriptionString) {
        toast('Ошибка при создании темы:', {description: descriptionString})
        exceptionCallback()
        return
    }

        try {
            const group = await createGroup(data)
            toast(`Группа с названием ${data.title} успешно созданa!`)
            callback()
        } catch (error) {
            (error as Error).message === "400" 
                ?   toast('Ошибка при создании группы:', {description: 'Тема с таким названием уже существует'})
                :   toast.error('Ошибка при создании темы:', {description: 'Неизвестная ошибка'})
            
        }
        
    }