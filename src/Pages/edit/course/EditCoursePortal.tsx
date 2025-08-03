import { useNavigate, useSearchParams } from "react-router-dom";
import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { Loader } from '../../../Components/ui/Loader'
import { TopicElement } from "./components/TopicElement";
import { useEditCourseStore } from "./api/editCourseStore";
import { useCreateTopic } from "./hooks/createTopicHandler";
import { useTopicStore } from "@/stores/useTopicStore";

export function TopicsPortal() {
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    
    const {
        isError, 
        isLoading, 
        createdStatus
    } = useEditCourseStore()
    const {createdTopics, fetchTopics} = useTopicStore()
    const createHandler = useCreateTopic()
    
    useLayoutEffect(() => {
        if (!courseId) {
            navigate('/')
            return 
        }
        fetchTopics(courseId)
    }, [courseId])

    if (isLoading || createdStatus.isCreating) {
        return <Loader /> 
    }

    return (
        <Fragment>
            <header className="portal-header">
                <h1>Темы созданные мной</h1>
                <div style={{width: '300px'}}>
                </div>
            </header>

            {createdTopics[courseId] ? 
                <div className="grid grid-flow-row grid-cols-4 gap-x-3 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-baseline">
                    {createdTopics[Number(courseId)].map((topic, index) => 
                        <TopicElement 
                            key={topic.id}
                            topic={topic}
                            index={index}
                        />
                    )}
                </div> 
                : <p className="no-courses-message">
                    {isError 
                        ?   "Ошибка при запросе. Пожалуйста перезагрузите страницу" 
                        :   "Нет созданных тем"
                    }</p>
            }
        </Fragment>
    )
}