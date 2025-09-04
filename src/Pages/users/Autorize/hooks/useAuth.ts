import { loginUser } from "@/services/api.service"
import { useUserStore } from "@/stores/useUserStore"
import { use, useState } from "react"
import { boolean } from "zod"

export const useAuth = () => {
    const {regUser} = useUserStore()
    const [Error, setError] = useState<{field: string}>({field: ''})

    function validator (data: FormData) { 
        if (data.get('login')!.toString().length < 3) {
            setError({field: 'login'})
            return false
        } 

        if (data.get('password')!.toString().length < 3) {
            setError({field: 'password'})
            return false
        } 
        return true
    }

    function resetError (field: string) {
        (Error.field === field || Error.field === 'auth') && setError({field: ''})
    }

    function handleAuth (form: HTMLFormElement) {
        const data = new FormData(form)

        if (!validator(data)) return

        loginUser(data.get('login')!.toString(), data.get('password')!.toString(), Boolean(data.get('remember')!))
        .then( user => {
            regUser({
                username: user.username, 
                name: user.name, 
                roles: user.roles, 
                telegram_link: user.telegram_link
            })
        })    
        .catch( error => {       
            switch (Number(error.message)) {
                case 401:
                    setError({field: 'auth'})
                    break
            }
        })
    }

    return {handleAuth, Error, resetError}
}