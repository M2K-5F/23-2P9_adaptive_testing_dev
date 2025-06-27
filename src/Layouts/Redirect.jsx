import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { userStore } from '../stores/userStore'
import {useRedirect} from '../hooks/useRedirect'

export default function MainRedirect ({checkAccount = false}) {
    const storageClearURIs = ["/createform", '/showform']
    const storageClearKeys = ['formdata', 'createformdata']
    const nav = useNavigate()
    const {nick} = userStore()

    useEffect( () => {
        !storageClearURIs.includes(window.location.pathname) &&
            Object.keys(sessionStorage).forEach((key) => {
                storageClearKeys.forEach( storageKey => {
                    key.startsWith(storageKey) && sessionStorage.removeItem(key)
                    key.includes('id=') && sessionStorage.removeItem(key)
                })
            })
        }
    , [window.location.pathname])

    return(
        <Outlet />
    )
}