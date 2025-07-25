import { Outlet, useNavigate } from "react-router-dom"
import {userStore} from "../stores/userStore"
import { useRef, useLayoutEffect, FC } from "react"
import {Loader} from '../Components/Loader'
import { isRolePathAvailable, isStatusPathAvailable } from "../config/routes.config"
import { ApiService } from "../services/api.service"
import { ThemeSwitcher } from "@/Components/ThemeSwither"


export const RedirectWrapper: FC =  () => {
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
    

    return(<>
            <ThemeSwitcher /> 
            <Outlet />
    </>
    )
}