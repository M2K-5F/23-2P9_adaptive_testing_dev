import { loginUser } from "@/services/api.service"
import { useUserStore } from "@/stores/useUserStore"
import { use, useState } from "react"
import { boolean } from "zod"

export const useAuth = () => {
    const {regUser} = useUserStore()
    const [isLoginFieldError, setLoginFieldError] = useState<boolean>(false)
    const [isPasswordFieldError, setPasswordFieldError] = useState<boolean>(false)
    const [isAuthError, setIsAuthError] = useState<boolean>(false)
    const [passwordFieldValue, setPasswordFieldValue] = useState<string>('')
    const [loginFieldValue, setLoginFieldValue] = useState<string>('')

    function loginHandler (value: string) {
        setLoginFieldError(false)
        setIsAuthError(false)
        setLoginFieldValue(value)
    }

    function passwordHandler (value: string) {
        setPasswordFieldError(false)
        setIsAuthError(false)
        setPasswordFieldValue(value)
    }

    function validator () { 
        if (loginFieldValue.length < 3) {
            setLoginFieldError(true)
            return false
        } 

        if (passwordFieldValue.length < 3) {
            setPasswordFieldError(true)
            return false
        } 
        return true
    }

    function handleAuth () {
        if (!validator()) return

        loginUser(loginFieldValue, passwordFieldValue)
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
                    setIsAuthError(true)
                    break
            }
        })
    }

    return {isAuthError, isLoginFieldError, isPasswordFieldError, handleAuth, passwordHandler, loginHandler, passwordFieldValue, loginFieldValue}
}