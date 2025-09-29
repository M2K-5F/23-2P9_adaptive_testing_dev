import { ValueContext } from "@/layouts/AuthLayout";
import { registerUser } from "@/services/api.service";
import { ChangeEvent, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { create } from "zustand";
import {immer} from 'zustand/middleware/immer'

interface State {
    values: {
        username: string
        name: string
        password: string
        repeat: string
        telegram_link: string
    }
    role: 'student' | 'teacher'
}

type FieldError = false | 'unvalid'

interface Error {
    errors: {
        username: FieldError | 'alreadyused'
        name: FieldError
        password: FieldError
        repeat: FieldError | 'notmatches'
        telegram_link: FieldError | 'validate_error'
    }    
}

interface Actions {
    setRole: (newrole: 'teacher' | 'student') => void
    fieldSetter: (e: ChangeEvent<HTMLInputElement>) => void
    useRegistration: (setPage: React.Dispatch<React.SetStateAction<"auth" | "reg">>) => void
    reset: () => void
}

export const useRegStore = create<State & Error & Actions>()(
    immer((set, get) => ({
        values: { 
            username: '', 
            name: '', 
            password: '', 
            repeat: '',
            telegram_link: '',
        },

        role: 'student',
        
        errors: { 
            username: false, 
            name: false, 
            password: false, 
            repeat: false,
            telegram_link: false
        },

        fieldSetter: (e) => {
            set((draft) => {
                const field = e.currentTarget.id as keyof State['values']
                draft.values[field] = e.currentTarget.value
                draft.errors[field] = false
            })
        },

        setRole: (newrole) => set({ role: newrole }),

        reset: () => set((state) => {
            state.values = { username: '', name: '', password: '', repeat: '', telegram_link: ''}
            state.role = 'student'
            state.errors = { username: false, name: false, password: false, repeat: false, telegram_link: false }
        }),

        useRegistration: async (setPage) => {
            
            let isError = false
            set((draft) => {
                const fields = Object.entries(draft.values) as [keyof State['values'], string][]
                
                for (const [key, value] of fields) {
                    if (value.length < 3) {
                        draft.errors[key] = 'unvalid'
                        isError = true
                    }
                }

                if (draft.values.password !== draft.values.repeat) {
                    draft.errors.repeat = 'notmatches'
                    isError = true
                } else {draft.errors.repeat = false}
            })
            const values = get().values
            if (!isError) {
                try {
                    const response = await registerUser(JSON.stringify({
                        username: values.username, 
                        name: values.name,
                        telegram_link: values.telegram_link,
                        password: values.password,
                        role: get().role
                    }))
                    toast('Пользователь зарегистрирован!', {
                        description: `Учетная запись с именем: ${get().values.name} зарегистрирована!`,
                        action: {
                            label: 'Авторизоваться',
                            onClick: () => {setPage('auth')}
                        }
                    })
                } catch (error: any) {
                    error.message === '400' && set(draft => {draft.errors.username = 'alreadyused'})
                    error.message === '422' && set(d => {d.errors.telegram_link = 'validate_error'})
                }
            }   
        },
    }))
)