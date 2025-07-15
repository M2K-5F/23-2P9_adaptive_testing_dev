import { Outlet, useNavigate } from "react-router-dom"
import ThemeSwitcher from "../Components/ThemeSwither"
import UserProfile from "../Components/UserMenu"
import {userStore} from "../stores/userStore"
import { useRef, useLayoutEffect } from "react"
import { WaitModal } from "../Components/WaitModal"
import {Loader} from '../Components/Loader'
import { isPathAvailable } from "../config/routes.config"
import { ApiService } from "../services/api.service"


export default function MainLOUT () {
    const navigate = useNavigate()
    const status = userStore().status
    ApiService.setNavigate(navigate)

    const shouldRedirect =
        (['student', 'teacher'].includes(status) && !isPathAvailable(status)) ||
        (status === 'forbidden' && !isPathAvailable('forbidden')) ||
        (status === 'unautorized' && !isPathAvailable('unautorized')) ||
        (status === 'serverunavailable')

    
    useLayoutEffect(() => {
        if (!shouldRedirect) return

        if (['student', 'teacher'].includes(status) && !isPathAvailable(status)) {
            navigate(`/for${status}`)
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
        return <Loader /> 
    }

    if (shouldRedirect) {
        return null
    }
    console.log(status)
    

    return(
        <>
            <nav id="main-nav">
                <img 
                id="icon" 
                src="../assets/logo.svg" 
                alt="Логотип" 
                onClick={() => {
                    sessionStorage.removeItem('formdata')
                    status === 'student'
                    ? navigate('/forstudent')
                    : navigate('/forteacher')
                }} 
                />

                <aside>
                    {window.location.pathname === '/users/autorize' 
                        ?   null 
                        :   <UserProfile /> 
                    }
                    
                    <ThemeSwitcher />

                </aside>
            </nav>
            <Outlet />
        </>
    )
}