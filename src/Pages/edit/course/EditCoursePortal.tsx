import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { CreatedTopic } from "../../../types/interfaces";
import { Loader } from '../../../Components/Loader'
import { toast, ToastContainer } from "react-toastify";
import {SearchContainer} from '../../../Components/SearchContainer'
import { TopicElement } from "./components/TopicElement";
import {topicSearch} from '../../../utils/topicSearch'
import { useEditCourseStore } from "./api/editCourseStore";
import { useCreateTopic } from "./hooks/createTopicHandler";
import { useTopicStore } from "@/stores/useTopicStore";

export function TopicsPortal() {
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const expandedTopic = Number(params.get('expanded'))
    
    const {
        isError, 
        isLoading, 
        createdStatus,
        toggleIsMenuOpen
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
        <div className="teacher-portal">

            <header className="portal-header">
                <h1>Темы созданные мной</h1>
                <div style={{width: '300px'}}>
                    
                    
                </div>
            </header>

            {createdTopics[Number(courseId)] ? 
                <div className="courses-flex">
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
        </div>
    )
}