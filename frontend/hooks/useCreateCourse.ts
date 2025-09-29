import { createCourse } from '@/services/course'
import { toast } from "sonner"
import { useId } from "react"

export const useCreateCourse = () => async ([titleId, descriptionId]: ReturnType<typeof useId>[], callback: () => void, exceptionCallback: () => void) => {
        const titleInput = document.querySelector(`#${titleId}[name=title]`) as HTMLInputElement
        const title = titleInput.value.trim()
        const descInput = document.querySelector(`#${descriptionId}[name=description]`) as HTMLInputElement
        const desc = descInput.value.trim()
        
        if (title.length < 3) {
            toast("Название должно содержать минимум 3 символа")
            exceptionCallback()
            return
        }

        if (desc.length < 3) {
            toast("Описание должно содержать минимум 3 символа")
            exceptionCallback()
            return
        }


        try {
            await createCourse(title, desc)
            toast(`Курс с названием ${title} успешно создан!`)
            titleInput.value = ""
            descInput.value = ''
            callback()
        } catch (error) {
            toast(
                (error as Error).message === '400' 
                    ?   'Курс с таким названием уже существует' 
                    :   'Ошибка при создании курса'
            )
        }
        
    }