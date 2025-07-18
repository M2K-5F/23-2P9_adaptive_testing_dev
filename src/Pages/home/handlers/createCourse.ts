import { toast } from "react-toastify"
import { createCourse } from "../../../services/api.service"
import { formToJSON } from "axios"
import {toastContainerIds} from '../../../config/toasts.constant'

export const handleCreateCourse = () => {
        const input = document.getElementById("course-title-input") as HTMLInputElement
        const title = input.value.trim()
        
        if (title.length < 3) {
            toast.error("Название должно содержать минимум 3 символа", {containerId: toastContainerIds.homeContainer})
            return
        }

        createCourse(title)
        .then(() => {
            input.value = ""
        })
        .catch((error: Error) => {
            if (error.message === "400") {
                toast.error('Курс с таким названием уже существует', {containerId: toastContainerIds.homeContainer})
            } else {
                toast.error('Ошибка при создании курса', {containerId: toastContainerIds.homeContainer})
            }
            throw Error
        })
    }