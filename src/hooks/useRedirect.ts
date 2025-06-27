import { Pathname } from "history"
import { useNavigate } from "react-router-dom"
import { userStore } from "../stores/userStore"
import { useEffect } from "react"
import { isPathAvailable, Paths } from "../config/routes.config"

export const useRedirect = (redirectURI?: Pathname) => {
    const nav = useNavigate()
    const userstatus = userStore().status
    const URL = window.location.pathname
    useEffect(() => {
        if ( !isPathAvailable(userstatus)) {
            nav(redirectURI ? redirectURI : `/for${userstatus}`), console.log('redirected')
        }
    }, [URL])
    return
}