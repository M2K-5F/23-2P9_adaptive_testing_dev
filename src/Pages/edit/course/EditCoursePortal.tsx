import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { CreatedTopic } from "../../../types/interfaces";
import { Loader } from '../../../Components/Loader'
import { toast, ToastContainer } from "react-toastify";
import {SearchContainer} from '../../../Components/SearchContainer'
import { TopicElement } from "./components/TopicElement";
import {topicSearch} from '../../../utils/topicSearch'
import { useEditCourseStore } from "./store/editCourseStore";
import { useCreateTopic } from "./hooks/createTopicHandler";

export default function TopicsPortal() {
    const nav = useNavigate()
    const courseId = useSearchParams()[0].get('course_id')
    const {
        createdTopics,
        isError, 
        expandedTopic, 
        isLoading, 
        createdStatus,
        fetchTopics,
        setExpandedTopic,
        toggleIsMenuOpen
    } = useEditCourseStore()
    const createHandler = useCreateTopic()
    
    if (!courseId) {
        nav('/courses')
        return null
    }


    useLayoutEffect(() => {
        if (isLoading) fetchTopics(courseId)
    }, [isLoading])

    useEffect(() => { 
        if (createdStatus.isCreated) {
            toast.success('Тема успешно создана', {containerId: 'create-topic-output'})
        }
    }, [createdStatus.isCreating])

    console.log(expandedTopic);
    
    if (isLoading || createdStatus.isCreating) {
        return <Loader /> 
    }

    return (
        <div className="teacher-portal">
            <ToastContainer containerId={'create-topic-output'} theme='dark' style={{top: "250px", marginLeft: 'auto', right: '100px'}} position='top-right' /> 

            <SearchContainer<CreatedTopic>
            placeholder="Поиск по названию темы..."
            searchfn={(query, callback) => callback(topicSearch(createdTopics, query))}
            handlefn={(topic) => {setExpandedTopic(topic.id)}}
            summary={{name: 'Создан: ', content: 'created_by'}}
            />

            <header className="portal-header">
                <h1>Темы созданные мной</h1>
                <div style={{width: '300px'}}>
                    {createdStatus.isMenuOpen &&
                        <div 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                            marginBottom: '10px'
                        }}>
                            <input 
                            id="topic-title-input" 
                            style={{
                                width: '100%',
                                borderRadius: '5px',
                                color: "black", 
                                backgroundColor: 'white', 
                                caretColor: "black",
                                padding: '8px'
                            }}
                            placeholder="Название темы" 
                            />

                            <textarea
                            id="topic-desc-input"
                            style={{
                                resize: 'none',
                                width: "100%",
                                borderRadius: '5px',
                                color: "black",
                                backgroundColor: 'white',
                                caretColor: "black",
                                padding: '8px',
                                minHeight: '60px'
                            }}
                            placeholder="Описание темы"
                            />

                            <div 
                            style={{
                                display: 'flex', 
                                gap: '5px', 
                                width: "100%", 
                                justifyContent: "center"
                            }}>

                                <button 
                                className="create-course-btn" 
                                onClick={createHandler}
                                style={{marginRight: '5px'}}
                                >
                                    ✔ Создать
                                </button>

                                <button 
                                style={{backgroundColor: 'red'}}
                                className="create-course-btn"  
                                onClick={toggleIsMenuOpen}
                                >
                                    × Отмена
                                </button>

                            </div>
                        </div>
                    }
                    {!createdStatus.isMenuOpen && (
                        <button 
                        style={{
                            marginLeft: '40%'
                        }}
                        className="create-course-btn"  
                        onClick={toggleIsMenuOpen}
                        >
                            + Создать новую тему
                        </button>
                    )}
                </div>
            </header>

            {createdTopics.length ? 
                <div className="courses-flex">
                    {createdTopics.map((topic, index) => 
                        <TopicElement 
                            key={topic.id}
                            topic={topic}
                            index={index}
                            isExpanded={expandedTopic === topic.id}
                        />
                    )}
                </div> 
                : <p className="no-courses-message">{isError ? "Ошибка при запросе. Пожалуйста перезагрузите страницу" : "Нет созданных тем"}</p>
            }
        </div>
    )
}