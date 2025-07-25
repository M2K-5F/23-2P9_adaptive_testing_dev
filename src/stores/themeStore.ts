import { create, StoreApi } from "zustand";

interface store {
    theme: 'light' | 'dark'
    toggleTheme: () => void
}

export const themeStore = create<store>((set, get) => {
    const theme = localStorage.getItem('theme') as 'light' | 'dark' ?? 'light'
    theme === 'dark' && document.documentElement.classList.add('dark')

    return {
        theme: theme,
        
        toggleTheme: () => {
            const th = get().theme
            console.log(th);
            document.documentElement.classList.toggle('dark')
            localStorage.setItem('theme', th === 'dark' ? 'light' : 'dark')
            set({theme: th === 'dark' ? 'light' : 'dark'})
        }
    }
})