import { Outlet, useNavigate } from "react-router-dom"
import ThemeSwitcher from "../Components/ThemeSwither"
import UserProfile from "../Components/UserMenu"
import {userStore} from "../stores/userStore"
import { useRef, useLayoutEffect } from "react"
import { WaitModal } from "../Components/WaitModal"
import { isPathAvailable } from "../config/routes.config"
import { ApiService } from "../services/api.service"


export default function MainLOUT () {
    const navigate = useNavigate()
    const status = userStore().status
    const wm = useRef(null)
    ApiService.setNavigate(navigate)

    const shouldRedirect =
        (['student', 'teacher'].includes(status) && !isPathAvailable(status)) ||
        (status === 'forbidden' && !isPathAvailable('forbidden')) ||
        (status === 'unautorized' && !isPathAvailable('unautorized')) ||
        (status === 'serverunavailable')

    
    useLayoutEffect(() => {
        if (!shouldRedirect) return

        if (['student', 'teacher'].includes(status) && !isPathAvailable(status)) {
            console.time('q')
            navigate(`/for${status}`)
            console.timeEnd('q')
        } 
        
        else if (status === 'forbidden' && !isPathAvailable('forbidden')) {
            navigate('/403')
        } 
        
        else if (status === 'unautorized' && !isPathAvailable('unautorized')) {
            navigate('/users/autorize')
        } 
        
        else if (status === 'serverunavailable') {
            console.time('time')
            navigate('/503')
            console.timeEnd('time')
            
        }
    }, [shouldRedirect, status, navigate])

    if (status === 'undefined') {
        return <WaitModal ref={wm} isOpen />
    }

    if (shouldRedirect) {
        return null
    }
    console.log(status)
    

    return(
        <>
            <nav id="main-nav">
                <img id="icon" src="../assets/logo.svg" alt="Логотип" onClick={() => {
                    sessionStorage.removeItem('formdata')
                    status === 'student'
                    ? navigate('/forstudent')
                    : navigate('/forteacher')
                }} /> 
                <nav className="top-nav">
                </nav>
                <aside>
                    {window.location.pathname === '/users/autorize' ? null : <UserProfile /> }
                    <ThemeSwitcher />
                    <svg onClick={() => {
                        const newWindow = window.open("", "_self")
                        newWindow?.close()
                    }} viewBox="0 0 16 16" width="25" height="25" display="inline-block" overflow="visible" >
                        <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z"></path>
                    </svg>
                </aside>
            </nav>
            <Outlet />
        </>
    )
}