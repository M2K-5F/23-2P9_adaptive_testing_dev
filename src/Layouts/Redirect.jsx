import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { userStore } from "../Static/store";

export default function MainRedirect ({checkAccount = false}) {
    const storageClearURIs = ["/createform", '/showform']
    const storageClearKeys = ['formdata', 'createformdata']
    
    const nav = useNavigate()
    const {nick} = userStore()
    useEffect(() => {if (checkAccount) {
        !nick 
        ? nav('/users/autorize')
        : null
    } else {
        nav('/users/autorize')
    }})

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