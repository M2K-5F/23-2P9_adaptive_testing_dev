import { Dispatch, SetStateAction, useState, useEffect, useLayoutEffect} from "react"
import {CreatedTopic, CreatedQuestion} from '../../../../types/interfaces'
import {useFlexOrder} from '../../../../hooks/useFlexOrder'
import {getQuestions, archTopic } from '../../../../services/api.service'
import {QuestionElement} from '../components/QuestionElement'


export const TopicElement = ({ 
    topic, 
    loadingSetter,
    index,
    isExpanded
}: {
    topic: CreatedTopic, 
    loadingSetter: Dispatch<SetStateAction<boolean>>,
    index: number,
    isExpanded?: boolean
}) => {
    const [expanded, setExpanded] = useState<boolean>(false)
    const [questions, setQuestions] = useState<CreatedQuestion[] | undefined>()
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
        <article onClick={() => setExpanded(!expanded)} style={{order: order}} className={`course-card ${!topic.is_active ? 'archived' : ''} ${expanded ? 'expanded' : ''}`}>
            <section className="summary">
                <div className="course-header">
                    <h3>{topic.title}</h3>
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
                    {!questions?.length && <span>Нет созданных вопросов</span>}
                    {questions?.length && questions.map( question => 
                        <QuestionElement key={question.id} question={question} /> 
                    )}
                </section>}
        </article>
    )
}