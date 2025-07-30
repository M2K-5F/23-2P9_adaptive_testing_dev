import { Dispatch, SetStateAction, useState, useEffect, useLayoutEffect} from "react"
import {CreatedTopic, CreatedQuestion, Question} from '../../../../types/interfaces'
import {useFlexOrder} from '../../../../hooks/useFlexOrder'
import {getQuestions, archTopic } from '../../../../services/api.service'
import {QuestionElement} from '../components/QuestionElement'
import { CreatedQuestionElement } from "./CreateQuestionElement"
import {Loader} from '../../../../Components/Loader'
import { useSearchParams } from "react-router-dom"
import { useTopicStore } from "@/stores/useTopicStore"


export const TopicElement = ({ topic, index }: {
    topic: CreatedTopic, 
    index: number,
}) => {
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const expandedTopic = Number(params.get('expanded'))
    const isExpanded = expandedTopic === topic.id
    const fetchTopics = useTopicStore(s => s.fetchTopics)
    const order = useFlexOrder(index, isExpanded)
    const handleExpand = () => {
        setParams(p => {
            p.set('expanded', `${isExpanded ? '0': topic.id}`)
            return p
        })
    }
    


    return (
        <article>
            <section>
                <div>
                    <h3  onClick={() => {}}>{topic.title}</h3>

                    <button
                        onClick={() => {
                            archTopic(topic.id)
                            .then(() => {
                                fetchTopics(courseId)
                            })
                        }}
                        title={topic.is_active ? 'Архивировать' : 'Разархивировать'}
                    >{
                        topic.is_active ? '🗄️' : '📦'
                    }</button>
                </div>

                <p>{topic.description || "Нет описания"}</p>

                <div>
                    Статус: {topic.is_active ?
                        <span key={topic.id} className="active">Активный</span>
                        :
                        <span key={topic.id} className="archived">В архиве</span>
                    }
                </div>

                <div>
                        <button style={{backgroundColor: isExpanded ? 'red': ''}} onClick={handleExpand}>
                            {isExpanded ? 'Закрыть тему' : 'Перейти к теме'}
                        </button>
                </div>
            </section>

            {isExpanded && <TopicSummary topic={topic} />}
        </article>
    )
}

const TopicSummary = (props: {
    topic: CreatedTopic
}) => {
    const [isLoading, setIsLoading] = useState(true)
    const [questions, setQuestions] = useState<CreatedQuestion[]>([])
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        if (isLoading) {
            getQuestions(props.topic.id)
            .then((data: CreatedQuestion[]) => {
                setQuestions(data)
            })
            .finally(() => setIsLoading(false))
        }
    })
    

    return(
        <section className="details">

                    <h4 style={{marginTop: '10px'}}>Вопросы темы:</h4>

                    {!isLoading ? 
                        (questions?.length ? 
                            questions.map(question => 
                                <QuestionElement key={question.id} loadingSetter={setIsLoading} question={question} /> 
                            ) : 
                            <h5 style={{margin: '10px 10px'}}>Нет созданных вопросов</h5> 
                        ) : 
                        <Loader /> 
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
                        topic_id={props.topic.id}
                        topicLoadingSetter={setIsLoading}
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
                </section>
    )
}