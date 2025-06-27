import { create } from "zustand"
import { userStoreShema, userShema, status } from "../types/interfaces"
import { logoutUser } from "../services/api.service"
import { APIUrls } from "../config/api.constants"


export const userStore = create<userStoreShema>( set => {

    return{
        status: 'undefined',
        nick : 'undefined',
        RegUser: (data: Partial<userShema>) => {
            set({
                nick : data.nick,
                status : data.status,
            })
        },
        DelUser: () => {
            logoutUser()
            set({
                nick: undefined,
                status: 'unautorized',
            })
        }
    }
})

export const pingUser = async () => {
    const response = await fetch(
        APIUrls.usersMeURL,
        {
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw Error(String(response.status))
    }
    
    console.log('response returned')
    return response.json()
}

pingUser()
    .then((user: userShema) => {
        
        userStore.setState( 
            (state) => ({
                ...state, nick: user.nick, status: user.status
            })
        )}
    )
    .catch( 
        error => {             
            if (error.message === '403'){
                logoutUser()
                userStore.setState( 
                    state => ({...state, status: 'forbidden'})
                )
            } else if (error.message === '401') {
                userStore.setState(
                    state => ({...state, status: 'unautorized'})
                )
            } else {
                userStore.setState(
                    state => ({...state, status: 'serverunavailable'})
                )
            }
        }
    )
