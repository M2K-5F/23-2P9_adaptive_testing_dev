import { useEffect, useLayoutEffect, useState } from "react"
import { CreatedQuestion, CreatedTopic } from "../../../types/interfaces"
import { useSearchParams } from "react-router-dom"
import { archTopic, getQuestions } from "../../../services/api.service"
import { QuestionElement } from "../../edit/course/components/CreatedQuestion"
import { Loader } from "../../../Components/ui/Loader"
import { useFlexOrder } from '../../../hooks/useFlexOrder'

export const TopicElement = ({ topic, index, onStartTopic }: {
    topic: CreatedTopic, 
    index: number,
    onStartTopic?: () => void
}) => {


    return (
        <article className={`course-card ${!topic.is_active ? 'archived' : ''}`}>
            <section className="summary">
                <div className="course-header">
                    <h3 style={{height: '30px', alignContent: 'center'}}>{topic.title}</h3>
                </div>

                <p>{topic.description || "Нет описания"}</p>

                <div className="course-status">
                    Статус: {topic.is_active ?
                        <span key={topic.id} className="active">Активный</span>
                        :
                        <span key={topic.id} className="archived">В архиве</span>
                    }
                </div>

                <div style={{display: 'flex', gap: '10px'}} className="course-actions">
                    {topic.is_active ?  
                        <button 
                            onClick={onStartTopic}
                        >
                            Начать тему
                        </button>
                        :<h3 style={{height: '30px', color: 'red'}}>Эта тема заархивирована!<br/>Прохождение заблокировано</h3>
                    }
                </div>
            </section>
        </article>
    )
}
