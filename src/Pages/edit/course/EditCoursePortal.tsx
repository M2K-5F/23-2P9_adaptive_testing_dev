import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState } from "react";
import { createTopic, getTopics } from "../../../services/api.service";
import { CreatedTopic } from "../../../types/interfaces";
import { Loader } from '../../../Components/Loader'
import { toast, ToastContainer } from "react-toastify";
import {SearchContainer} from '../../../Components/SearchContainer'
import { TopicElement } from "./components/TopicElement";
import {topicSearch} from '../../../utils/topicSearch'

export default function TopicsPortal() {
    const nav = useNavigate()
    const courseId = useSearchParams()[0].get('course_id')
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [topicList, setTopicList] = useState<CreatedTopic[]>([])
    const [isCreating, setIsCreating] = useState<"creating" | 'created' | false>(false)
    const [expandedTopic, setExpandedTopic] = useState<number>(-1)
    
    if (!courseId) {
        nav('/courses')
        return null
    }
    
    
    const handleCreateTopic = () => {
        const titleInput = document.getElementById("topic-title-input") as HTMLInputElement
        const descInput = document.getElementById("topic-desc-input") as HTMLInputElement
        const title = titleInput.value.trim()
        const description = descInput.value.trim()
        
        if (title.length < 3) {
            toast.error("Название должно содержать минимум 3 символа", {containerId: 'create-topic-output'})
            return
        }

        if (description.length < 3) {
            toast.error("Описание должно содержать минимум 3 символа", {containerId: 'create-topic-output'})
            return
        }

        createTopic(title, description, courseId)
        .then(() => {
            setIsLoading(true)
            setIsCreating('created')
            titleInput.value = ""
            descInput.value = ""
        })
        .catch((error: Error) => {
            if (error.message === "400") {
                toast.error('Тема с таким названием уже существует', {containerId: 'create-topic-output'})
            } else {
                toast.error('Ошибка при создании темы', {containerId: 'create-topic-output'})
            }
        })
    }


    useLayoutEffect(() => {
        if (isLoading === true) {
            getTopics(Number(courseId))
            .then(data => {                
                setTopicList(data)
            })
            .finally(() => setIsLoading(false))
        }
    }, [isLoading])

    useEffect(() => { 
        if (isCreating === 'created') {
            toast.success('Тема успешно создана', {containerId: 'create-topic-output'})
            setIsCreating(false)
        }
    }, [isCreating])

    console.log(expandedTopic);
    
    if (isLoading) {
        return <Loader /> 
    }

    return (
        <div className="teacher-portal">
            <ToastContainer containerId={'create-topic-output'} theme='dark' style={{top: "250px", marginLeft: 'auto', right: '100px'}} position='top-right' /> 

            <SearchContainer<CreatedTopic>
            placeholder="Поиск по названию темы..."
            searchfn={(query, callback) => callback(topicSearch(topicList, query))}
            handlefn={(topic) => {setExpandedTopic(topic.id)}}
            summary={{name: 'Создан: ', content: 'created_by'}}
            />

            <header className="portal-header">
                <h1>Темы созданные мной</h1>
                <div style={{width: '300px'}}>
                    {isCreating === 'creating' &&
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
                                onClick={handleCreateTopic}
                                style={{marginRight: '5px'}}
                                >
                                    ✔ Создать
                                </button>

                                <button 
                                style={{backgroundColor: 'red'}}
                                className="create-course-btn"  
                                onClick={() => setIsCreating(false)}
                                >
                                    × Отмена
                                </button>

                            </div>
                        </div>
                    }
                    {!isCreating && (
                        <button 
                        style={{
                            marginLeft: '40%'
                        }}
                        className="create-course-btn"  
                        onClick={() => setIsCreating('creating')}
                        >
                            + Создать новую тему
                        </button>
                    )}
                </div>
            </header>

            {topicList.length ? 
                <div className="courses-flex">
                    {topicList.map((topic, index) => 
                        <TopicElement 
                            key={topic.id}
                            topic={topic} 
                            loadingSetter={setIsLoading}
                            index={index}
                            isExpanded={expandedTopic === topic.id}
                        />
                    )}
                </div> 
                : <p className="no-courses-message">Нет созданных тем</p>
            }
        </div>
    )
}