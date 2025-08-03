import { Outlet, useNavigate } from "react-router-dom"
import {userStore} from "../stores/userStore"
import { useRef, useLayoutEffect, FC, memo, useEffect } from "react"
import {Loader} from '../Components/ui/Loader'
import { isRolePathAvailable, isStatusPathAvailable } from "../config/routes.config"
import { ApiService } from "../services/api.service"
import { ThemeSwitcher } from "@/Components/ui/ThemeSwither"


export const RedirectWrapper: FC = () => {
    const navigate = useNavigate()
    const {status, role} = userStore()

    const shouldRedirect =
        (status === 'authorized' && isStatusPathAvailable('unauthorized')) ||
        (status === 'forbidden' && !isStatusPathAvailable('forbidden')) ||
        (status === 'unauthorized' && !isStatusPathAvailable('unauthorized')) ||
        (status === 'serverunavailable')
    
    
    useEffect(() => ApiService.setNavigate(navigate), [])
    
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
        console.log(status)
    }, [shouldRedirect, status])

    if (status === 'undefined') {
        return <Loader /> 
    }

    if (shouldRedirect) {
        return null
    }
    

    return(
        <Outlet />
    )
}