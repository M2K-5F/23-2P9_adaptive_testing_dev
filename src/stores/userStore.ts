import { create } from "zustand"
import { userStoreShema, userShema, status, fetchedUserShema } from "../types/interfaces"
import { logoutUser } from "../services/api.service"
import { APIUrls } from "../config/api.constants"
import { use } from "react"


export const userStore = create<userStoreShema>( set => {

    return{
        status: 'undefined',
        nick : 'undefined',
        role: ['undefined'],
        regUser: (user: fetchedUserShema) => {
            set({nick: user.nick, role: user.status, status: 'authorized'})
        },
        pingUser: async () => {
            try {
                const response = await fetch(APIUrls.usersMeURL,{credentials: 'include'})
                const data = await response.json()
                console.log(data);
                
                if (response.ok) {
                    set({nick: data.nick, status: 'authorized', role: data.status})
                } else {
                    if (response.status === 403) {
                        logoutUser()
                        userStore.setState( 
                            state => ({...state, status: 'forbidden'})
                        )
                    } else if (response.status === 401) {
                        userStore.setState(
                            state => ({...state, status: 'unauthorized'})
                        )
                    }
                }
            } catch {
                userStore.setState(
                    state => ({...state, status: 'serverunavailable'})
                )
            }
            
            console.log('response returned') 
        },
        DelUser: () => {
            logoutUser()
            set({
                nick: undefined,
                status: 'unauthorized',
                role: ['undefined']
            })
        }
    }
})