import { Pathname } from "history"
import { Path, useNavigate } from "react-router-dom"
import { userStore } from "./store"
import { useEffect } from "react"

const PathDepends = {
    'student': ['/forstudent', '/showform'],
    'teacher': ['/forteacher', '/createform', '/forteacher/results'],
}

export const useRedirect = (redirectURI?: Pathname) => {
    const nav = useNavigate()
    const userstatus: 'student' | 'teacher' = userStore().status
    const URL = window.location.pathname
    useEffect(() => {
        if ( ! PathDepends[userstatus].includes(URL)) {
            nav(redirectURI ? redirectURI : `/for${userstatus}`), console.log('redirected')
        }
    }, [URL])
    return
}