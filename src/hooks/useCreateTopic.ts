import { toast } from "sonner"
import { toastContainerIds } from "../config/toasts.constant"
import { useEditCourseStore } from "../Pages/edit/course/api/editCourseStore"

export const useCreateTopic = () => {
    const createTopic = useEditCourseStore(store => store.createTopic)
    return (courseId: number, titleId: string, descriptionId: string) => {
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
            return
        }

        createTopic(title, description, String(courseId))
        .then(() => {
            titleInput.value = ""
            descInput.value = ""
        })
        .catch((error: Error) => {
            if (error.message === "400") {
                toast('Ошибка при создании темы:', {description: 'Тема с таким названием уже существует'})
            } else {
                toast.error('Ошибка при создании темы:', {description: 'Неизвестная ошибка'})
            }
        })
    }
}