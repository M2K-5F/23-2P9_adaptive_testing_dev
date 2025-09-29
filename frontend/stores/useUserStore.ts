import { create } from "zustand"
import { userStoreShema, UserShema} from "../types/interfaces"
import { logoutUser } from "../services/api.service"
import { APIUrls } from "../config/api.constants"
import { use } from "react"
import { u } from "node_modules/shadcn/dist/index-8c784f6a"


export const useUserStore = create<userStoreShema>( set => {

    return{
        status: 'undefined',
        username: 'undefined',
        name: 'undefined',
        telegram_link: 'undefined',
        roles: ['undefined'],
        regUser: (user: UserShema) => {
            set({
                username: user.username, 
                name: user.name, 
                roles: user.roles, 
                status: 'authorized',
                telegram_link: user.telegram_link
            })
        },
        pingUser: async () => {
            try {
                const response = await fetch(APIUrls.usersMeURL,{credentials: 'include'})
                const data: UserShema = await response.json()
                if (response.ok) {
                    set({
                        username: data.username, 
                        name: data.name, 
                        status: 'authorized', 
                        telegram_link: data.telegram_link,
                        roles: data.roles
                    })
                } else {
                    if (response.status === 403) {
                        logoutUser()
                        useUserStore.setState( 
                            state => ({...state, status: 'forbidden'})
                        )
                    } else if (response.status === 401) {
                        useUserStore.setState(
                            state => ({...state, status: 'unauthorized'})
                        )
                    }
                }
                
            } catch {
                useUserStore.setState(
                    state => ({...state, status: 'serverunavailable'})
                )
            }
        },
        DelUser: () => {
            logoutUser()
            set({
                username: undefined,
                name: undefined,
                status: 'unauthorized',
                telegram_link: undefined,
                roles: ['undefined']
            })
        }
    }
})