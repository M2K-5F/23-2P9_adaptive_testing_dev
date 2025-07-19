import { memo, ChangeEvent, SetStateAction, Dispatch } from "react"
import { Answer, Question } from "../../../../types/interfaces"
import { Updater, useImmer } from "use-immer"
import { toast, ToastContainer } from "react-toastify"
import { createQuestion } from "../../../../services/api.service"


const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}


export const CreatedQuestionElement = memo((props: {
    topicLoadingSetter: Dispatch<SetStateAction<boolean>>
    isCreatingSetter: Dispatch<SetStateAction<boolean>>
    topic_id: number
}) => {
    const [createdQuestion, setCreatedQuestion] = useImmer<Question>({
        text: '', 
        question_type: 'single',
        answer_options: [
            {
                id: 0, 
                text: '', 
                is_correct: true
            },
        ]
    })

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

        const toCreate: Question = {
            text: question.text, 
            question_type: question.question_type, 
            answer_options: question.answer_options.map(answer => ({
                text: answer.text, is_correct: answer.is_correct
            }))
        }

        createQuestion(props.topic_id, toCreate)
        .then(() => {
            toast.success('Вопрос в теме успешно создан', {containerId: 'edit-course-portal-output'})
            props.isCreatingSetter(false)
            props.topicLoadingSetter(true)
        })
        .catch((error: Error) => {
            console.log(error.message);
            
            switch (error.message) {
                case '404': 
                    toast.error('Ошибка ', {containerId: 'toast-output-2'})
                    break

                case '400':
                    toast.error('Вопрос с таким текстом уже создан в этой теме', {containerId: 'toast-output-2'})
                    break
            }
        })
        
    }


    return(
        <article className="create-question-container question-card expanded" >
            <input
            placeholder="Текст вопроса"
            style={{resize: 'none', textOverflow: 'ellipsis', width: '40%', marginBottom: '5px', fontSize: 'large'}}
            className="pretty_input"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
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
        <article style={{position: 'relative', borderRadius: '10px', border: '1px dashed black', marginBottom: '10px', padding: '10px', width: '40%'}} className="answer__container">

            {Boolean(props.index) && 
                <button
                onClick={() => {
                    props.questionSetter(draft => {
                        const options = draft.answer_options.filter((answer, index) => index !== props.index)
                        draft.answer_options = options
                    })
                }} 
                style={{
                    backgroundColor: 'white',
                    position: 'absolute', 
                    fontSize: 'medium', 
                    width: 'fit-content', 
                    marginLeft: 'auto',
                    marginRight: '10px', 
                    cursor: 'pointer',
                    marginTop: '10px',
                    border: '1px solid black',
                    borderRadius: "5px",
                    padding: '3px'
                }}
                >
                    🗑️
                </button>
            }

            <header style={{marginBottom: '5px'}}>
                <label className="answer__text__label">{`Вариант ответа №${props.index + 1}:`}</label>
            </header>

            <div 
            style={{display: 'flex', width: '90%', justifyContent: 'space-between'}}
            >
                <input maxLength={115} minLength={3}
                style={{width: '90%'}}
                className="pretty_input"
                value={props.answer.text}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const value = event.currentTarget.value
                    props.questionSetter(draft => {draft.answer_options[props.index].text = value})
                }}
                />

                <input required
                style={{width: '15px'}}
                type='checkbox'
                className="answer__text__radio"
                checked={props.answer.is_correct}
                onClick={ (event) => {
                    const checked = event.currentTarget.checked
                    props.questionSetter(draft => {
                        if (!(draft.answer_options.filter(answer => answer.is_correct).length === 1 && !checked)) {
                            draft.answer_options[props.index].is_correct = checked
                        }
                        const correctAnswers = draft.answer_options.filter(answer => answer.is_correct).length
                        if (correctAnswers > 1) {
                            draft.question_type = 'multiple'
                        } else {
                            draft.question_type ='single'
                        }
                    })
                } }
                onChange={ (event: ChangeEvent<HTMLInputElement>) => {
                    //
                } }
                />
            </div>
        </article>
    )
})