import { Navigate, useNavigate } from "react-router-dom";
import { userStore } from "../stores/userStore";
import React, { FormEvent, MouseEvent, useRef } from "react";

export default function UserProfile () {
    const {nick, DelUser, status} = userStore()
    const navigate = useNavigate()

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        status !== 'unautorized' ? event.currentTarget.classList.toggle('active') : navigate('/users/autorize')
    }
    

    return(
        <div  className="profile-container">
            <div onClick={(event) => handleClick(event)} className="user-shower">
                <span >{ status === 'unautorized' ? 'Войти' : nick}</span>
                { window.location.pathname !== '/users/registration' && <div className="arrow-element" />}
            </div>
            <div className="user-menu">
                <button onClick={() => { document.querySelector('.active')?.classList.remove('active'), DelUser()}}>Выйти</button>
            </div> 
        </div>
    )
}