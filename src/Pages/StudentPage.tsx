import { ChangeEvent, FormEvent, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../Components/Input"
import React from "react"
import axios from "axios"
import { Waitmodal, WaitModal } from '../Components/WaitModal'
import { useRedirect } from "../Static/utils"
import { ThrowStore } from "../Static/store"

export default function StudentNavigator () {
    useRedirect()
    const {ThrowMsg} = ThrowStore()
    const navigate = useNavigate()
    const waitmodal: Waitmodal = useRef(null)


    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        waitmodal.current?.showModal()
        const form = event.currentTarget
        const data = Object.fromEntries(new FormData(event.currentTarget))
        const value = data.value as string
        let id: string | null
        if (Number(value)) {
            id = value
        } else {
            value.includes('http://localhost:8001/showform?id=') 
                ? id = value.split('=')[1]
                : id = "0"
        }
        console.log(id)
        const request = fetch(`http://localhost:8001/auth/ping_poll/${id ?? ''}`, {
            credentials: 'include'
        })
        request
        .then((response) => {
        console.log(response);
        
        if (response.ok) {
            console.log('log');
            
            navigate(`/showform?id=${id}`)
        } else {    
            waitmodal.current?.close()
            ThrowMsg('value', form) 
        }
        })
        .catch(() => {
            waitmodal.current?.close()
            alert('что-то не так')
        })
    }

    const handleChange = (e: InputEvent) => {
        // (e.currentTarget! as HTMLInputElement).value = (e.currentTarget! as HTMLInputElement).value.replace(/[^\d]/g, '')
    };

    return(
        <>
            <main className="studentnavigator__container">
                <WaitModal ref={waitmodal} /> 
                <form 
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    handleSubmit(event)
                }} 
                id="studentnavigator__form" >

                    <legend>Найти форму</legend>

                    <Input isPretty required
                    name="value"
                    placeholder="id или ссылка" 
                    onChange={(event: InputEvent) => 
                        handleChange(event)
                    } 
                    max={50} min={1} 
                    invalidMessage="Такого теста не существует" />

                    <button 
                    className="pretty_button" 
                    title="connect" 
                    type="submit" >
                        Подключиться
                    </button>

                </form>
            </main>
        </>
    )
}