import { ChangeEvent, Dispatch, FormEvent, memo, RefObject, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { Question, Form } from "../types/interfaces";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../config/api.constants";
import { useRedirect } from "../hooks/useRedirect";
import { WaitModal } from "../Components/WaitModal";
import { SuccessfulModal } from "../Components/SuccessfulModal";
// import { getPoll, submitAnswers } from "../services/api.service";

export default function ShowForm () {
    const params = new URLSearchParams(window.location.search)
    const waitmodal: RefObject<HTMLDialogElement | null> = useRef(null)
    const successfulmodal: RefObject<null| HTMLDialogElement> = useRef(null)
    const subform = {
        title: 'title',
        description : 'desctiption',
        questions: [
            {
                id: 1,
                text: 'question',
                answer_options: [
                    {
                        id: 1,
                        text : 'answer',
                    },
                ]
            }
        ]
    }
    
    const [form, setForm]: [Form, any] = useState(
        sessionStorage.getItem(`formdata#?id=${params.get('id')}`) 
        ? JSON.parse(sessionStorage.getItem(`formdata#?id=${params.get('id')}`)!) 
        :  subform
    )

    if (!sessionStorage.getItem(`formdata#?id=${params.get('id')}`)) {
        getPoll(Number(params.get("id")))
        .then( (data) => {
            sessionStorage.setItem(`formdata#?id=${params.get('id')}`, JSON.stringify(data))
            setForm(data)
        })
        .catch( error => {
            waitmodal.current?.close()
            switch (Number(error.message)) {
                case 404:
                    setForm({
                        title: 'Форма недоступна',
                        description: "Попробуйте запросить позже"
                    })
            }
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
        waitmodal.current?.showModal()
        submitAnswers(Number(params.get("id")), JSON.stringify({answers: requestBody}))
        .then( request => {
            waitmodal.current?.close()
            successfulmodal.current?.showModal()
        })
        .catch( error => {
            waitmodal.current?.close()
            switch (Number(error.message)) {
                case 400:
                    alert('Вы уже отправляли эту форму')
            }
        })
    }

    return(
        <main className="showform__container ">
            <WaitModal ref={waitmodal} isOpen/> 
            <SuccessfulModal ref={successfulmodal} labels={['Форма отправлена', "Вернуться на главную страницу"]} redirectURI={'/'} />

            <header className={}> { form.title } </header>
            <form onSubmit={(event: FormEvent<HTMLFormElement>) => {
                submitHandler(event)
            }} >

                <h4 > { form.description } </h4>

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