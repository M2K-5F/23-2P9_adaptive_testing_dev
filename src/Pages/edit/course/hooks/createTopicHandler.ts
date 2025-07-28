import { useSearchParams } from "react-router-dom"
import { toastContainerIds } from "../../../../config/toasts.constant"
import { toast } from 'react-toastify'
import { useEditCourseStore } from "../api/editCourseStore"

export const useCreateTopic = () => {
    const createTopic = useEditCourseStore(store => store.createTopic)
    const courseId = useSearchParams()[0].get('course_id')!
    const handler = () =>  {
        const titleInput = document.getElementById("topic-title-input") as HTMLInputElement
        const descInput = document.getElementById("topic-desc-input") as HTMLInputElement
        const title = titleInput.value.trim()
        const description = descInput.value.trim()

        if (title.length < 3) {
            toast.error("Название должно содержать минимум 3 символа", {containerId: toastContainerIds.createQuestionContainer})
            return
        }

        if (description.length < 3) {
            toast.error("Описание должно содержать минимум 3 символа", {containerId: toastContainerIds.createQuestionContainer})
            return
        }

        createTopic(title, description, courseId)
        .then(() => {
            titleInput.value = ""
            descInput.value = ""
        })
        .catch((error: Error) => {
            if (error.message === "400") {
                toast.error('Тема с таким названием уже существует', {containerId: toastContainerIds.createQuestionContainer})
            } else {
                toast.error('Ошибка при создании темы', {containerId: toastContainerIds.createQuestionContainer})
            }
        })
    }
    
    return () => {handler()}
}