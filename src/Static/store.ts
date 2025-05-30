import { create, StoreApi } from "zustand";
import {userStoreShema, userShema, ShowFormShema, Form} from './interfaces'
import {Theme} from './types.ts'
import { HookHandler, ServerHook } from "vite";
import { ReactInstance } from "react";


export const userStore = create<userStoreShema>( set => ({
    status: JSON.parse(
                (localStorage.getItem('userdata')
                ?? sessionStorage.getItem('userdata')) 
                ?? '{"status": "student"}' 
            ).status,

    nick : JSON.parse(
            (localStorage.getItem('userdata') 
            ?? sessionStorage.getItem('userdata')) 
            ?? `{"nick": null}`
        ).nick,
    RegUser: (data: Partial<userShema>, isRemember: boolean) => {
        set({
            nick : data.nick,
            status : data.status,
        }),
        isRemember 
        ? localStorage.setItem('userdata', JSON.stringify(data))
        : sessionStorage.setItem('userdata', JSON.stringify(data))
    },
    DelUser: () => {
        set({
            nick: undefined,
            status: 'student',
        }),
        localStorage.removeItem('userdata')
        sessionStorage.removeItem('userdata')
    }
}))

export const themeStore = create(set => ({
    theme:<Theme> 'light',

    init: () => {
        if (localStorage.getItem('theme') === 'dark') {
            set({theme: 'dark'})
            document.documentElement.classList.add('theme-dark')
            return true
        }
        return false
    },
    
    toggleTheme: () => {
        if (!localStorage.getItem('theme')) {
            localStorage.setItem('theme', 'dark') 
            set({theme : 'dark'})
            document.documentElement.classList.add('theme-dark')
        } else {
        localStorage.getItem('theme') === 'light' 
            ? [localStorage.setItem('theme', 'dark'), set({theme : 'dark'}), document.documentElement.classList.add('theme-dark')] 
            : [localStorage.setItem('theme', 'light'), set({theme : 'light'}), document.documentElement.classList.remove('theme-dark')]
        }
    }
}))

export const showFormStore = create<ShowFormShema>( set => ({
    form: {
        title: 'title',
        description : 'desctiption',
        questions: [
            {
                id: 1,
                text: 'question',
                answer_options: [
                    {
                        id: 1,
                        text : 'answer',
                    },
                ]
            }
        ]
    },

    setForm : (fom: Form) => set({
        form: {
            title: fom.title,
            description: fom.description,
            questions: fom.questions
        }
    })
}))


export const useURL = create<{URL: Partial<URL>}>(() => ({
    URL: {
        hostname: "http://127.0.0.1:8001"
    }
}))

export const ThrowStore = create<{ThrowMsg: (name: string, formElement: HTMLFormElement, forName?: boolean ) => void}>( () => ({
    ThrowMsg: function( name: string, formElement: HTMLFormElement, showAlready?: boolean) {
        if (name === 'username') {
            showAlready
                ? formElement.querySelector(`input[name=${name}] + label`)!.innerHTML = 'Пользователь с данным именем уже существует'
                : formElement.querySelector(`input[name=${name}] + label`)!.innerHTML = 'Некорректное имя пользователя'
        }
        
        const element: HTMLInputElement = formElement.querySelector(`[name=${name}]`)!
        element?.classList.remove('invalid')
        element?.offsetWidth
        element?.classList.add('invalid')
        element?.offsetWidth
    }
}))