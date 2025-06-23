import { ChangeEvent, FormEvent, RefObject, useContext, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../Components/Input"
import React from "react"
import axios from "axios"
import { WaitModal } from '../Components/WaitModal'
import { URL } from "../config/api.constants"
import {useRedirect} from '../hooks/useRedirect'
import { ThrowMsg } from "../utils/form.utils"
// import { pingPoll } from "../services/api.service"

export default function StudentNavigator () {
    const navigate = useNavigate()
    const waitmodal: RefObject<null | HTMLDialogElement> = useRef(null)


    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        waitmodal.current?.showModal()
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

        pingPoll(Number(id))
        .then( () => {
            navigate(`/showform?id=${id}`)
        })
        .catch( error => {
            waitmodal.current?.close()
            switch (Number(error.message)) {
                case 404:
                    ThrowMsg('value')
                    break
            }
        })
    }

    const handleChange = (e: InputEvent) => {
        (e.currentTarget! as HTMLInputElement).value = (e.currentTarget! as HTMLInputElement).value.replace(/[^\d]/g, '')
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
                    // onChange={(event: InputEvent) => 
                    //     handleChange(event)
                    // } 
                    max={8} min={1} 
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