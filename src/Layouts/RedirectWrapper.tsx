import { Outlet, useNavigate } from "react-router-dom"
import {useUserStore} from "../stores/useUserStore"
import { useRef, useLayoutEffect, FC, memo, useEffect } from "react"
import { isStatusPathAvailable } from "../config/routes.config"
import { ApiService } from "../services/api.service"
import { Loader } from "@/Components"


export const RedirectWrapper: FC = () => {
    const navigate = useNavigate()
    const status = useUserStore(s => s.status)
    

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
    }, [shouldRedirect, status])

    if (status === 'undefined') {
        return( 
            <div className="h-dvh w-dvw flex items-center justify-center">
                <Loader variant='success' />
            </div> 
        )
    }

    if (shouldRedirect) {
        return null
    }
    

    return(
        <Outlet />
    )
}