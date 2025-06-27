import { create, StoreApi } from "zustand";
import {userStoreShema, userShema, ShowFormShema, Form} from '../types/interfaces.ts'
import {Theme} from '../types/types.ts'

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