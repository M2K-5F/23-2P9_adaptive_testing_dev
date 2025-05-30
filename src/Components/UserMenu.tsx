import { Navigate, useNavigate } from "react-router-dom";
import { userStore } from "../Static/store";
import React, { FormEvent, MouseEvent, useRef } from "react";

export default function UserProfile () {
    const {nick, DelUser} = userStore()
    const navigate = useNavigate()

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        nick ? event.currentTarget.classList.toggle('active') : navigate('/users/autorize')
    }
    

    return(
        <div  className="profile-container">
            <div onClick={(event) => handleClick(event)} className="user-shower">
                <span >{ nick ?? 'Войти'}</span>
                { window.location.pathname !== '/users/registration' && <div className="arrow-element" />}
            </div>
            <div className="user-menu">
                <button onClick={() => { document.querySelector('.active')?.classList.remove('active'), DelUser(), navigate('/')}}>Выйти</button>
            </div> 
        </div>
    )
}