import React from "react"
import { FormEvent, RefObject, useRef, useState } from "react"
import { ThrowStore, useURL } from "../Static/store"
import { data, Form, useNavigate } from "react-router-dom"
import { RegistrationForm } from "../Static/interfaces"
import { Input } from "../Components/Input"
import { WaitModal } from "../Components/WaitModal"

export default function Regisration () {
    const SuccessfulModal: RefObject<HTMLDialogElement | null> = useRef(null)
    const WaitingModal: RefObject<HTMLDialogElement | null> = useRef(null)
    const user: RefObject<{login: string, password: string}> = useRef({login:'',password:''})
    const {URL} = useURL()
    const {ThrowMsg} = ThrowStore()

    
    function validate(form: HTMLFormElement) {
        const Form = Object.entries(Object.fromEntries(new FormData(form)) as Partial<RegistrationForm>)
        let password: string = ''
        let flag: boolean = true
        for (const [field, value] of Form) {
            
            if (field === 'password' && value ) {
                password = value
            } 

            if (field === 'repeat' && value) {
                if (value === password) {
                    continue
                } else {
                    ThrowMsg('repeat', form)
                    flag = false
                    continue
                }
            }

            if (!value || value.length < 3) {
                ThrowMsg(field, form)
                flag = false
                continue
            }

            
        }
        return flag ? Form : false
    }
    
    async function handleRegistration (event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const form = event.currentTarget
        const validatedForm = validate(form)
        if (validatedForm) {
                WaitingModal.current?.showModal()

                await fetch(`${URL.hostname}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(Object.fromEntries(validatedForm))
                })
                .then(responce => {
                    WaitingModal.current?.close()

                    if (responce.ok) {
                        SuccessfulModal.current?.showModal()
                        return Promise.resolve();
                    } else {
                        return responce.json()
                    }
                })
                .catch( err => {
                    setTimeout(function(){alert('что то с интернетом')}, 100)
                    WaitingModal.current?.close()
                    
                })
                .then( data => {
                    typeof data.detail == 'object'
                    ? data.detail[0].loc[1] === 'telegram_link'
                        ? ThrowMsg('telegram_link', form)
                        : null
                    : ThrowMsg('username', form, true)
                })
                
        }
    }


        return(
        <>
            <main className="registration-container">
                <Modal ref={SuccessfulModal} user={user} />
                <WaitModal ref={WaitingModal} /> 

                <form 
                onInvalid={
                    event => {validate(event.currentTarget)}
                } 
                onSubmit={
                    (event:FormEvent<HTMLFormElement>) => { handleRegistration(event) } 
                } 
                id="registration-form">

                    <legend>Регистрация</legend>

                    <Input 
                    isPretty
                    name='username' 
                    onChange={(event) => {
                        user.current.login = event.currentTarget.value
                    }} invalidMessage="Некорректный логин" />

                    <Input 
                    isPretty
                    name='name' 
                    onChange={undefined}
                    invalidMessage="Некорректное имя пользователя" /> 

                    <Input 
                    isPretty
                    name="telegram_link" 
                    onChange={undefined}
                    defaultValue="https://t.me/example-user.com" 
                    invalidMessage="Неправильная ссылка"/> 

                    <fieldset>
                        {/* <legend>Выберите роль:</legend>   */}

                        <div>
                            <input type="radio" checked
                            name="role"
                            defaultValue='teacher'
                            className="main_radio"
                            id="for_teacher"/>

                            <label htmlFor="for_teacher">Учитель</label>

                            <input type="radio"
                            name="role"
                            defaultValue='student'
                            className="main_radio"
                            id="for_student"
                            checked
                            />
                            
                            <label htmlFor="for_student">Студент</label>
                        </div>


                    </fieldset>

                    <Input 
                    isPretty
                    name='password' 
                    onChange={(event) => {
                        user.current.password = event.currentTarget.value
                    }}
                    invalidMessage="Пароль слишком короткий"/> 

                    <Input
                    isPretty
                    name='repeat' 
                    onChange={undefined}
                    invalidMessage="Пароли не совпадают" /> 

                    <button type='submit' className="pretty_button">Зарегистрироваться</button>
                </form>
            </main>
        </>
    )
}

const Modal = ({ref, user}) => {
    const nav = useNavigate()

    return(
        <>
            <dialog className="SuccessfulModal"  ref={ref}>
                <p>Вы зарегистрированы!</p>
                <button className="main_button" onClick={() => { nav(`/users/autorize?login=${user.current.login}&password=${user.current.password}`)}} >Авторизоваться</button>
            </dialog>
        </>
    )
}