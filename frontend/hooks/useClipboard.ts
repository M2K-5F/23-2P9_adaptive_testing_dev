import { useState } from "react";
import { toast } from "sonner";

export const useClipboard = () => {

    const copy = async (text: string) => {
        if (!navigator.clipboard) {
            toast.error("Буфер обмена не поддерживается")
            return false
        }

        try {
            await navigator.clipboard.writeText(text)
            toast.success('Скопировано')
            return true
        } catch (err) {
            toast.error("Ошибка:" + err)
            return false
        }
    }

    return copy
}