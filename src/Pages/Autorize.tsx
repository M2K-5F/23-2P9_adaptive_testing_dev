import { useNavigate } from "react-router-dom"
import React, { FormEvent, RefObject, useEffect, useRef } from "react"
import { Authentification, Identification, Auth } from "../Static/Users"
import { ThrowStore, userStore, useURL } from "../Static/store"
import { Input } from "../Components/Input"
import {WaitModal} from '../Components/WaitModal'
import { useRedirect } from "../Static/utils"

export default function Autorize () {
    const nav = useNavigate()
    const {URL} = useURL()
    const {DelUser, RegUser} = userStore()
    const queryParams = new URLSearchParams(window.location.search)
    const {ThrowMsg} = ThrowStore()
    const waitmodal: RefObject<HTMLDialogElement | null> = useRef(null)


    function handleAuth (event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        waitmodal.current!.showModal()
        const request = fetch(`http://localhost:8001/auth/login`, {
            method: 'POST',
            credentials: "include",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( Object.fromEntries( new FormData(event.currentTarget)))
        })
        
        request.then( response => {
            if (response.ok) {
                waitmodal.current?.close()
                return response.json()
            } else {
                waitmodal.current?.close()
                alert('что то не так')
            }
        }).then(data => {
            RegUser({nick: data.username!, status: data.role!},true)
            nav('/')
        })
    }


    return(
        <main className="auth-container">
            <WaitModal ref={waitmodal} isOpen={false} /> 
            <form onSubmit={(event) => {handleAuth(event)}} id="auth-form">
                <legend>Авторизация</legend>

                <Input required 
                name="username" 
                min={3} max={50} 
                defaultValue={ queryParams.get('login') ?? '' } 
                invalidMessage="Некорректное имя пользователя" 
                isPretty/>
                
                <Input required
                name="password" 
                min={3} max={50} 
                defaultValue={ queryParams.get('password') ?? '' } 
                invalidMessage="Некорректный пароль" 
                isPretty/>

                <div id="checkbox-container"> 
                    <input defaultChecked={true} id="remember" type='checkbox' />
                    <label htmlFor="#remember"> Запомнить меня</label>
                </div>
                <button type='submit' className="pretty_button" >Авторизоваться</button>
            </form>
            <div onClick={ () => { nav('/users/registration') } } id="reg-link" >Нет аккаунта?<br /><span>ЗАРЕГИСТРИРОВАТЬСЯ!</span></div>
        </main>
    )
}



            {/* <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                <path d="M10.6699 2.75C14.674 2.75 17.9199 5.99594 17.9199 10C17.9199 11.7319 17.3127 13.3219 16.2995 14.5688L21.2003 19.4697C21.4931 19.7626 21.4931 20.2374 21.2003 20.5303C20.934 20.7966 20.5173 20.8208 20.2237 20.6029L20.1396 20.5303L15.2387 15.6295C13.9918 16.6427 12.4018 17.25 10.6699 17.25C6.66586 17.25 3.41992 14.0041 3.41992 10C3.41992 5.99594 6.66586 2.75 10.6699 2.75ZM10.6699 4.25C7.49428 4.25 4.91992 6.82436 4.91992 10C4.91992 13.1756 7.49428 15.75 10.6699 15.75C13.8456 15.75 16.4199 13.1756 16.4199 10C16.4199 6.82436 13.8456 4.25 10.6699 4.25Z" fill="white"></path>
            </svg> */}