import { FormEvent, RefObject, useRef, useState } from "react"
import { data, Form, useNavigate } from "react-router-dom"
import { RegistrationForm } from "../types/interfaces"
import { Input } from "../Components/Input"
import { WaitModal } from "../Components/WaitModal"
import { URL } from "../config/api.constants";
import { ThrowMsg } from "../utils/form.utils"
import { registerUser } from "../services/api.service"

export default function Regisration () {
    const SuccessfulModal: RefObject<HTMLDialogElement | null> = useRef(null)
    const WaitingModal: RefObject<HTMLDialogElement | null> = useRef(null)
    const user: RefObject<{login: string, password: string}> = useRef({login:'',password:''})
    const navigate = useNavigate()

    
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
                    ThrowMsg('repeat')
                    flag = false
                    continue
                }
            }

            if (!value || value.length < 3) {
                ThrowMsg(field)
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

            registerUser( JSON.stringify(Object.fromEntries(validatedForm)))
            .then( () => {
                WaitingModal.current?.close()
                SuccessfulModal.current?.showModal()
            })
            .catch( error => {
                WaitingModal.current?.close()
                switch (Number(error.message)) {
                    case 422:
                        ThrowMsg('telegram_link')
                        break
                        
                    case 400: 
                        ThrowMsg("username", "Имя пользователя занято")
                        break
                }
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
                            <input type="radio" 
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
                            defaultChecked
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
                <label>Вы зарегистрированы!</label>
                <button className="main_button" onClick={() => { nav(`/users/autorize?login=${user.current.login}&password=${user.current.password}`)}} >Авторизоваться</button>
            </dialog>
        </>
    )
}