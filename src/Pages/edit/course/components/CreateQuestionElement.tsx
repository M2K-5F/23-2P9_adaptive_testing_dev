import { memo, ChangeEvent, SetStateAction, Dispatch } from "react"
import { Button } from "../../../../Components/Button"
import { Answer, Question } from "../../../../types/interfaces"
import { Updater, useImmer } from "use-immer"


const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}


export const CreatedQuestionElement = memo((props: {
    isCreatingSetter: Dispatch<SetStateAction<boolean>>
}) => {
    const [createdQuestion, setCreatedQuestion] = useImmer<Question>({id: 0, answer_options: [{text: '', is_correct: false, id: 0}], text: '', question_type: 'single'})


    return(
        <article className="question__container" >
            <label className="question__text__label">Текст вопроса:</label>
            <textarea 
            className="main_input"
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                const value = event.currentTarget.value
                setCreatedQuestion((draft) => {draft.text = value})
            }}
            value={createdQuestion.text} 
            />

            <label className="question__answers__label">Варианты ответов:</label>

            <fieldset className="">
                {createdQuestion.answer_options.map( (answer, index) => 
                    <AnswerElement 
                    index={index}
                    answer={answer}
                    questionSetter={setCreatedQuestion}
                    />
                )}
            </fieldset>
            
            <menu style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button
                className="create-course-btn"
                onClick={() => {
                    setCreatedQuestion(draft => {
                        draft.answer_options.push({id: draft.answer_options.length, text: '', is_correct: false})
                    })
                }}
                >
                    + Добавить вариант ответа
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
                required
                className="pretty_input"
                value={props.answer.text}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                    const value = event.currentTarget.value
                    props.questionSetter(draft => {draft.answer_options[props.index].text = value})
                    autoResizeTextarea(event.currentTarget)
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