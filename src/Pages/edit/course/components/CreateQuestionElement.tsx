import { memo, ChangeEvent, SetStateAction, Dispatch } from "react"
import { Button } from "../../../../Components/Button"
import { Answer, Question } from "../../../../types/interfaces"
import { Updater, useImmer } from "use-immer"
import { ThrowMsg } from "../../../../utils/form.utils"
import { toast, ToastContainer } from "react-toastify"
import { createQuestion } from "../../../../services/api.service"


const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}


export const CreatedQuestionElement = memo((props: {
    isCreatingSetter: Dispatch<SetStateAction<boolean>>
    topic_id: number
}) => {
    const [createdQuestion, setCreatedQuestion] = useImmer<Question>({answer_options: [{ id: 0, text: '', is_correct: false}], text: '', question_type: 'single'})

    const createQuestionFromDraft = () => {
        const question = createdQuestion

        if (!question.text ) {
            toast.error('Введите текст вопроса', {containerId: 'toast-output-2'})
            return
        }

        if (!question.answer_options.length) {
            toast.error('Как тебе удалось удалить первый вариант ответа!?', {containerId: 'toast-output-2'})
            return
        }
        
        if (question.answer_options.filter(answer => answer.text).length !== question.answer_options.length) {
            toast.error('Вы заполнили не все поля с ответами', {containerId: 'toast-output-2'})
            return
        }
        const correctAnswersCount = question.answer_options.filter(answer => answer.is_correct).length
        switch (true) {
            case correctAnswersCount === 0:
                toast.error('Выберите хотя бы один верный вариант ответа', {containerId: 'toast-output-2'})
                return
            
            case correctAnswersCount === question.answer_options.length:
                toast.error('Верными не могут быть все ответы', {containerId: 'toast-output-2'})
                return
        }

        const toCreate: Question = {text: question.text, question_type: question.question_type, answer_options: question.answer_options.map(answer => ({text: answer.text, is_correct: answer.is_correct}))}
        console.log(toCreate);
        
        createQuestion(props.topic_id, toCreate)
        .then(() => {
            toast.success('Вопрос в теме успешно создан', {containerId: 'edit-course-portal-output'})
            props.isCreatingSetter(false)
        })
        .catch((error: Error) => {
            switch (error.message) {
                case '400':

            }
        })
        
    }


    return(
        <article className="create-question-container question-card expanded" >
            <textarea
            style={{resize: 'none'}}
            className="pretty_input"
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                const value = event.currentTarget.value
                setCreatedQuestion((draft) => {draft.text = value})
            }}
            value={createdQuestion.text} 
            />

            <h5>Тип: {createdQuestion.question_type === 'single' ? "Один ответ" : "Несколько ответов"}</h5>

            <fieldset 
            style={{marginBottom: '10px'}} 
            className="answer-options"
            >
                <h5>Варианты ответов:</h5>
                {createdQuestion.answer_options.map( (answer, index) => 
                    <AnswerElement 
                    index={index}
                    answer={answer}
                    questionSetter={setCreatedQuestion}
                    />
                )}
            </fieldset>

            <output className="">
                <ToastContainer
                toastStyle={{marginBottom: '10px'}}
                pauseOnHover={false}
                className={'ToastifyBlock'}
                position='bottom-left'
                theme='dark'
                // autoClose={0}
                key="create-question-output-toast-container" 
                containerId="toast-output-2" 
                /> 
            </output>
            
            <menu 
            style={{
                display: 'flex', 
                gap: '10px', 
                marginBottom: '10px'
            }}>
                <button 
                title="Добавить вариант ответа"
                className="create-course-btn"
                onClick={() => {
                    setCreatedQuestion(draft => {
                        draft.answer_options.push({id: draft.answer_options.length, text: '', is_correct: false})
                    })
                }}
                >
                    + Добавить вариант ответа
                </button>

                <button 
                title="Создать вопрос в курсе"
                className="create-course-btn"
                onClick={() => createQuestionFromDraft()}
                >
                    ✔ Создать вопрос   
                </button>
            </menu>

        </article>
        
    )
})

const AnswerElement = memo((props: {
    answer: Answer
    questionSetter: Updater<Question>
    index: number
}) => {
    return(
        <article style={{backgroundColor: 'gray', padding: '10px', width: '33%'}} className="answer__container">
            <header style={{display: 'flex', width: '95%', justifyContent: 'space-between'}}>

                <label className="answer__text__label">{`Вариант ответа №${props.index + 1}:`}</label>

                {Boolean(props.index) && 
                    <button 
                    onClick={() => {
                        props.questionSetter(draft => {
                            const options = draft.answer_options.filter((answer, index) => index !== props.index)
                            draft.answer_options = options
                        })
                    }} 
                    style={{width: '30px', height: '30px', cursor: 'pointer'}}
                    >
                        🗑️
                    </button>
                }

            </header>
            <div>    
                <textarea maxLength={115} minLength={3}
                style={{resize: 'none'}}
                className="pretty_input"
                value={props.answer.text}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                    const value = event.currentTarget.value
                    props.questionSetter(draft => {draft.answer_options[props.index].text = value})
                }}
                />
            </div>

            <input required
            type='checkbox'
            className="answer__text__radio"
            checked={props.answer.is_correct}
            onClick={ (event) => {
                const checked = event.currentTarget.checked
                props.questionSetter(draft => {draft.answer_options[props.index].is_correct = checked})
            } }
            onChange={ (event: ChangeEvent<HTMLInputElement>) => {
                //
            } }/>
        </article>
    )
})