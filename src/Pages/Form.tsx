import { ChangeEvent, Dispatch, FormEvent, memo, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { showFormStore } from "../Static/store";
import { Question, Form } from "../Static/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { useRedirect } from "../Static/utils";
import { WaitModal } from "../Components/WaitModal";
import {Button} from '../Components/Button'
import { SuccessfulModal } from "../Components/SuccessfulModal";

export default function ShowForm () {
    useRedirect()
    const params = new URLSearchParams(window.location.search)
    const waitmodal: RefObject<HTMLDialogElement | null> = useRef(null)
    const successfulmodal: RefObject<null| HTMLDialogElement> = useRef(null)
    const subform = showFormStore().form
    const [form, setForm]: [Form, any] = useState(
        sessionStorage.getItem(`formdata#?id=${params.get('id')}`) 
        ? JSON.parse(sessionStorage.getItem(`formdata#?id=${params.get('id')}`)!) 
        :  subform
    )

    if (!sessionStorage.getItem(`formdata#?id=${params.get('id')}`)) {
        const request = fetch(`http://localhost:8001/auth/get_poll/${params.get('id')}`, {
            credentials: "include"
        })

        request
        .then( (response) => {
            return response.json()
        })
        .then( data => {
            sessionStorage.setItem(`formdata#?id=${params.get('id')}`, JSON.stringify(data))
            setForm(data)
        })
    } else {
        waitmodal.current?.close()
    }

    useEffect( () => {
        if (sessionStorage.getItem(`formdata#?id=${params.get('id')}`)) {
            waitmodal.current?.close()
        }
    }, [] )
    
    const submitHandler = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = Object.fromEntries(new FormData(event.currentTarget))
        let requestBody:Array<{}> = []
        Object.entries(data).forEach( ([queid, answid]) => {
            requestBody.push({'question_id': Number(queid), 'selected_option_ids': [Number(answid)]})
        })
        console.log({'answers': requestBody})
        const request = fetch(`http://localhost:8001/auth/polls/${params.get('id')}/submit-answers`, {
            credentials: 'include', 
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({answers: requestBody})
        })

        request.then(request => {
            if (request.ok) {
                successfulmodal.current?.showModal()
            } else {
                if (request.status == 400) {
                    alert('Вы уже отправляти эту форму')
                }
            }
        })
    }


    return(
        <main className="showform__container">
            <WaitModal ref={waitmodal} isOpen/> 
            <SuccessfulModal ref={successfulmodal} labels={['Форма отправлена', "Вернуться на главную страницу"]} redirectURI={'/'} />

            <header> { form.title } </header>
            <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
                submitHandler(event)
            }} >

                <h4> { form.description } </h4>

                <section className="showform__questions">
                    {form.questions.map(element => {
                        return <QuestionElement key={element.text} element={element} /> 
                    })}
                </section>
                <label >{''}</label>
                <button type='submit' className="pretty_button" >Отправить</button>
                
            </form>
        </main>
    )
}


const QuestionElement = (props: {element: Partial<Question>}) => {
    const {id} = useParams()
    const [activeAnswer, setActiveAnswer] = useState(sessionStorage.getItem(`${props.element.text}${id}`) ?? '')
    
    return(
        <article className="question__container">
            <legend className="question__legend" >{props.element.text}</legend>

            <fieldset className="question__answers__fieldset" >
                {props.element.answer_options!.map( answer => {

                    return <AnswerElement 
                    state={activeAnswer} 
                    setter={setActiveAnswer} 
                    questionid={props.element.id!}
                    answerid={answer.id!} 
                    key={answer.text} 
                    label={answer.text!} /> 
                })}
            </fieldset>
        </article>
    )
}

const AnswerElement = (answer: {state: string, setter: Dispatch<SetStateAction<string>>, label: string,questionid: number, answerid: number}) => {
    const id = new URLSearchParams(window.location.search)

    return(
        <article onClick={() => {
            if (answer.state === answer.label) {
                answer.setter('')
                sessionStorage.setItem(`${answer.questionid}${id}`, '')
                return
            } else {
            answer.setter(answer.label)
            }
            sessionStorage.setItem(`${answer.questionid}${id}`, String(answer.answerid))
        }} className="answer__container">

            <input required 
            onChange={ (event: ChangeEvent<HTMLInputElement>) => {event.currentTarget}} 
            type="radio" 
            className="answer__input" 
            name={String(answer.questionid)} 
            value={answer.answerid}
            checked={
                answer.state === answer.label 
                || sessionStorage.getItem(`${answer.questionid}${id}`) === String(answer.answerid)
            } />

            <label className="answer__label">{answer.label}</label> 
        </article>
    )
}