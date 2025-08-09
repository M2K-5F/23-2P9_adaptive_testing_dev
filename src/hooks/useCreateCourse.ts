import { createCourse } from '@/services/api.service'
import { toast } from "sonner"
import { useId } from "react"

export const useCreateCourse = () => async (inputId: ReturnType<typeof useId>, callback: () => void) => {
        const input = document.querySelector(`#${inputId}[name=title]`) as HTMLInputElement
        const title = input.value.trim()
        
        if (title.length < 3) {
            toast("Название должно содержать минимум 3 символа")
            return
        }

        try {
            await createCourse(title)
            toast(`Курс с названием ${title} успешно создан!`)
            input.value = ""
            callback()
        } catch (error) {
            toast(
                (error as Error).message === '400' 
                    ?   'Курс с таким названием уже существует' 
                    :   'Ошибка при создании курса'
            )
        }
        
    }