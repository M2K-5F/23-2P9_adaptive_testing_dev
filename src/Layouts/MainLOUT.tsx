import { Outlet, useNavigate } from "react-router-dom"
import ThemeSwitcher from "../Components/ThemeSwither"
import UserProfile from "../Components/UserMenu"
import {userStore} from "../stores/userStore"
import { useRef, useLayoutEffect } from "react"
import { WaitModal } from "../Components/WaitModal"
import {Loader} from '../Components/Loader'
import { isRolePathAvailable, isStatusPathAvailable } from "../config/routes.config"
import { ApiService } from "../services/api.service"


export default function MainLOUT () {
    const navigate = useNavigate()
    const {status, role} = userStore()
    ApiService.setNavigate(navigate)

    const shouldRedirect =
        (status === 'authorized' && isStatusPathAvailable('unauthorized')) ||
        (status === 'forbidden' && !isStatusPathAvailable('forbidden')) ||
        (status === 'unauthorized' && !isStatusPathAvailable('unauthorized')) ||
        (status === 'serverunavailable')

    
    useLayoutEffect(() => {
        if (!shouldRedirect) return

        if (status === 'authorized' && isStatusPathAvailable('unauthorized')) {
            navigate('/')
            return
        }
        
        if (status === 'forbidden' && !isStatusPathAvailable('forbidden')) {
            navigate('/403')
            return
        } 
        
        if (status === 'unauthorized' && !isStatusPathAvailable('unauthorized')) {
            navigate('/users/autorize')
            return
        } 
        
        if (status === 'serverunavailable') {
            navigate('/503')
            return
        }

        if (!isRolePathAvailable(role)) {
            navigate('/')
            return
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
                onClick={() => {status === 'authorized' && navigate('/')}}
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