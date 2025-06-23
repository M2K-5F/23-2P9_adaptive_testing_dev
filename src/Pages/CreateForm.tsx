import { URL } from "../config/api.constants";
import { ChangeEvent, memo, RefObject, useCallback, useRef, useState } from "react";
import { Answer, Form, Question} from "../types/interfaces";
import { Input } from '../Components/Input'
import { Button } from "../Components/Button";
import { useImmer } from "use-immer";
import { WaitModal } from "../Components/WaitModal";
import { SuccessfulModal } from "../Components/SuccessfulModal";
// import { createPoll } from "../services/api.service";
import { ThrowMsg } from "../utils/form.utils";
import { useNavigate } from "react-router-dom";

const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}

export default function Createform () {
    const sm: RefObject<null | HTMLDialogElement> = useRef(null)
    const wm: RefObject<null | HTMLDialogElement> = useRef(null)
    const [formid, setFormID] = useState(null)
    const navigate = useNavigate()

    const save = (data: any) => {
        sessionStorage.setItem('createformdata', JSON.stringify(data))
    }

        const [form, setForm] = useImmer(JSON.parse(sessionStorage.getItem('createformdata') ?? JSON.stringify({
                title: '',
                description: '',
                questions: [
                    {
                        text: '',
                        question_type: "single_choice",
                        answer_options: [
                            {
                                text: '',
                                is_correct: false
                            }
                        ]
                    }
                ]
            })
        ) as Form)
        
        const setDescription = useCallback((text: string) => 
            setForm( draft => {
                draft.description = text
                save(draft)
        }), [])

        const setTitle = useCallback((text: string) => 
            setForm( draft => {
                draft.title = text
                save(draft)
        }), [])

        const setQuestionText = useCallback((text: string, questionID: number) => 
            setForm( draft => {
                draft.questions[questionID].text = text
                save(draft)
        }), [])  
        
        const setAnswerText = useCallback((text: string, questionID: number, answerID: number) =>
            setForm( draft => {
                draft.questions[questionID].answer_options ||= []
                draft.questions[questionID].answer_options[answerID].text = text
                save(draft)
        }), [])
        
        const addQuestion = useCallback(() => setForm( draft =>
            {draft.questions.push({
                        text: '',
                        question_type: "single_choice",
                        answer_options: [
                            {
                                text: '',
                                is_correct: false
                            }
                        ]
                })
            save(draft)}
        ), [])

        const addAnswer = useCallback((questionID: number) => 
            setForm(draft =>{
                draft.questions ||= []
                draft.questions[questionID].answer_options.push({
                                text: '',
                                is_correct: false
                            })
            save(draft)
        }),[])

        const setAnswerCorrect = useCallback((state: boolean, questionID: number, answerID: number) =>
            setForm( draft => {
                draft.questions[questionID].answer_options ||= []
                draft.questions[questionID].answer_options.forEach((answer) => {
                if (answer.id === answerID) {
                    answer.is_correct = state
                } else {answer.is_correct = false}
            })
            draft.questions[questionID].answer_options[answerID].is_correct = state
            save(draft)
    }), [])

    async function sendForm (formdata) {
        wm.current?.showModal()

        createPoll(JSON.stringify(formdata))
        .then(response => {
            wm.current?.close()
                    setFormID(response.id ?? 'error')
                    sm.current?.showModal()
        })
        .catch( error => {
            wm.current?.close()

            switch (Number(error.message)) {
                case 400:
                    ThrowMsg('title', 'Заголовок формы уже используется')
                    break

                case 403:
                    navigate('/403')
                    break
            }
        })
    }


    return(
        <main className="createform__container" >
            {/* <symbol>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                    <path fill="#9575CD" d="M34,12l-6-6h-8l-6,6h-3v28c0,2.2,1.8,4,4,4h18c2.2,0,4-1.8,4-4V12H34z"></path>
                    <path fill="#7454B3" d="M24.5 39h-1c-.8 0-1.5-.7-1.5-1.5v-19c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7
                    1.5 1.5v19C26 38.3 25.3 39 24.5 39zM31.5 39L31.5 39c-.8 0-1.5-.7-1.5-1.5v-19c0-.8.7-1.5 1.5-1.5l0
                    0c.8 0 1.5.7 1.5 1.5v19C33 38.3 32.3 39 31.5 39zM16.5 39L16.5 39c-.8 0-1.5-.7-1.5-1.5v-19c0-.8.7-1.5
                    1.5-1.5l0 0c.8 0 1.5.7 1.5 1.5v19C18 38.3 17.3 39 16.5 39z"></path>
                    <path fill="#B39DDB" d="M11,8h26c1.1,0,2,0.9,2,2v2H9v-2C9,8.9,9.9,8,11,8z"></path>
                </svg>
            </symbol> */}
            <SuccessfulModal ref={sm} labels={[`Форма с id ${formid} создана`, `Вернуться в меню`]} redirectURI="/" children={
                <a onClick={() => {
                    try {
                        navigator.clipboard.writeText(`${URL}/showform?id=${formid}`)
                        alert('Успешно скопировано')
                    } catch {
                        alert('Ошибка при копировании')
                    }
                }}>
                    Копировать ссылку
                </a>
            } />
            <WaitModal ref={wm} /> 
            <form className="createform__form"
            onSubmit={(event) => {
                event.preventDefault()
                sendForm(form)
            }}
            >
                <header className="createform__header" >
                    <label className="createform__title__label">Заголовок формы:</label>

                    <Input isPretty
                    required
                    className="createform__title__input"
                    value={form.title}
                    onChange ={( event: ChangeEvent<HTMLInputElement> ) => 
                        setTitle(event.currentTarget.value) 
                    } 
                    invalidMessage="Слишком короткое поле"
                    min={3}
                    placeholder="" 
                    name="title" />

                </header>

                    <label className="createform__description__label" >Описание формы:</label>

                    <textarea 
                    maxLength={180}
                    minLength={3}
                    required
                    placeholder=""
                    value={form.description}
                    className="createform__description__textarea "
                    onChange ={( event: ChangeEvent<HTMLTextAreaElement> ) => {
                        setDescription(event.currentTarget.value)
                        autoResizeTextarea(event.currentTarget)
                    }}
                    name="description" />

                <section className="createform__questions__container">
                    {form.questions.map( (question, index) => 
                    <QuestionElement 
                    addAnswer={addAnswer}
                    key={index} 
                    question={question} 
                    id={index} 
                    answerTextSetter={setAnswerText} 
                    questionTextSetter={setQuestionText}
                    answerCorrectSetter={setAnswerCorrect} 
                    /> )}
                    <Button 
                    className="createform__addquestion__button"
                    isPretty
                    text="+ добавить вопрос"
                    onclick={() => {
                        addQuestion()
                    }}
                    type="button" />
                </section>

                <section className="buttons__section">
                    <Button
                    className="createform__submit__button"
                    isPretty
                    type='submit'
                    text="Отослать" />
                    <Button isPretty
                    type='button'
                    text="Очистить"
                    onclick={() => {
                        sessionStorage.removeItem('createformdata')
                        setForm({
                        title: '',
                        description: '',
                        questions: [
                            {
                                text: '',
                                question_type: "single_choice",
                                answer_options: [
                                    {
                                        text: '',
                                        is_correct: false
                                    }
                                ]
                            }
                        ]
                    })}} />
                </section>
            </form>
        </main>
    )
}

const QuestionElement = memo((props: {
    question: Question
    id: number
    answerTextSetter: Function
    questionTextSetter: Function
    answerCorrectSetter: Function
    addAnswer: Function
}) => {


    return(
        <article className="question__container" >
            <label className="question__text__label" htmlFor="">Текст вопроса:</label>
            <textarea maxLength={110} minLength={3}
            required
            className="question__text__input  pretty_input"  
            name={`answer${props.id}text`}
            placeholder=""
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                props.questionTextSetter(event.currentTarget.value, props.id)
            }}
            value={props.question.text} />
            
            <label style={{height: '0px', width: '0px'}} hidden />
            <label className="question__answers__label">Варианты ответов:</label>

            <fieldset className="question__answers__container">
                {props.question.answer_options.map( (answer, index) => 
                    <AnswerElement 
                    key={(props.id + index * index)}
                    answerTextSetter={props.answerTextSetter} 
                    AnswerCorrectSetter={props.answerCorrectSetter} 
                    answer={answer} 
                    queid={props.id} 
                    id={index} 
                    addAnswer={props.addAnswer}/> 
                )}
                <Button isPretty
                className=" question__addanswer__button"
                type='button' 
                onclick={() => 
                    props.addAnswer(props.id)
                } 
                text="+ Добавить вариант ответа"/>

            </fieldset>

        </article>
        
    )
})

const AnswerElement = memo((props: {
    answer: Answer, 
    id: number, 
    answerTextSetter: Function,
    queid: number, 
    AnswerCorrectSetter: Function
    addAnswer: Function
}) => {


    return(
        <article className="answer__container">
            <div>
                <label className="answer__text__label">{`Вариант ответа №${props.id + 1}:`}</label>
                
                <textarea maxLength={115} minLength={3}
                required
                className="answer__text__input textarea"
                value={props.answer.text}
                name={`answer${props.queid}.${props.id}`}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                    props.answerTextSetter(event.currentTarget.value, props.queid, props.id )
                    autoResizeTextarea(event.currentTarget)
                }}
                />
            </div>

            <input required
            className="answer__text__radio"
            type='radio' 
            name={`${props.queid}answers`} 
            value={`${props.id}`} 
            checked={props.answer.is_correct}
            onClick={ (event) => {
                props.AnswerCorrectSetter(false, props.queid, props.id )
            } }
            onChange={ (event: ChangeEvent<HTMLInputElement>) => {
                props.AnswerCorrectSetter(event.currentTarget.checked, props.queid, props.id )
            } }/>
        </article>
    )
})
