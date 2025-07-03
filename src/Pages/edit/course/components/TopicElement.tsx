import { Dispatch, SetStateAction, useState, useEffect, useLayoutEffect} from "react"
import {CreatedTopic, CreatedQuestion, Question} from '../../../../types/interfaces'
import {useFlexOrder} from '../../../../hooks/useFlexOrder'
import {getQuestions, archTopic } from '../../../../services/api.service'
import {QuestionElement} from '../components/QuestionElement'
import { CreatedQuestionElement } from "./CreateQuestionElement"
import { Button } from "../../../../Components/Button"
import { useImmer } from "use-immer"


export const TopicElement = ({ topic, loadingSetter, index, isExpanded }: {
    topic: CreatedTopic, 
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    index: number,
    isExpanded?: boolean
}) => {
    const [expanded, setExpanded] = useState<boolean>(false)
    const [questions, setQuestions] = useState<CreatedQuestion[] | undefined>()
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const order = useFlexOrder(index, expanded)

    useLayoutEffect(() => {
        if (isExpanded) {
            setExpanded(true)
        } else { setExpanded(false)}
    }, [isExpanded])

    useEffect(() => {
        if (expanded) {
            getQuestions(topic.id)
            .then((data: CreatedQuestion[]) => setQuestions(data))
            .catch((error: Error) => setQuestions([]))
        }
    }, [expanded] ) 
    


    return (
        <article style={{order: order}} className={`course-card ${!topic.is_active ? 'archived' : ''} ${expanded ? 'expanded' : ''}`}>
            <section className="summary">
                <div className="course-header">
                    <h3  onClick={() => setExpanded(!expanded)}>{topic.title}</h3>
                        <button
                        onClick={() => {
                            archTopic(topic.id)
                            .then(() => {
                                loadingSetter(true)
                            })
                        }}
                        className="archive-btn"
                        title={topic.is_active ? 'Архивировать' : 'Разархивировать'}
                        >{
                            topic.is_active ? '🗄️' : '📦'
                        }</button>
                </div>
                <p>{topic.description || "Нет описания"}</p>
                <div className="course-status">
                    Статус: {topic.is_active ?
                        <span key={topic.id} className="active">Активный</span>
                        :
                        <span key={topic.id} className="archived">В архиве</span>
                    }
                </div>
                <div className="course-actions">
                        <button style={{backgroundColor: expanded ? 'red': ''}} onClick={() => setExpanded(!expanded)}>
                            {expanded ? 'Закрыть тему' : 'Перейти к теме'}
                        </button>
                </div>
            </section>
            {expanded && 
                <section className="details">
                    <h4 style={{marginTop: '10px'}}>Вопросы темы:</h4>
                    {questions?.length ? 
                        questions.map( question => 
                            <QuestionElement key={question.id} question={question} /> 
                        ) : 
                        <h5 style={{margin: '10px 10px'}}>Нет созданных вопросов</h5> 
                    }
                    {!isCreating ?
                        <button 
                        style={{marginLeft: '10px', height: '35px'}} 
                        onClick={() => {setIsCreating(true)}} 
                        className="create-course-btn"
                        >
                            + Создать вопрос
                        </button> 
                            :
                        <>
                        <CreatedQuestionElement 
                        topic_id={topic.id}
                        isCreatingSetter={setIsCreating}
                        />
                        
                        <menu>
                            <button
                            style={{backgroundColor: 'red'}}
                            className="create-course-btn"
                            onClick={() => setIsCreating(false)}>
                                Отменить создание
                            </button>
                        </menu>
                        </>
                        }
                </section>}
        </article>
    )
}