import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from "react";
import { archTopic, createTopic, getTopics, getFollowedTopics } from "../services/api.service";
import { DraftFunction, Updater, useImmer } from "use-immer";
import { CreatedTopic } from "../types/interfaces";
import { Loader } from '../Components/Loader'
import { toast, ToastContainer } from "react-toastify";
import { useTopicSearch } from '../hooks/useTopicSearch'

export default function TopicsPortal() {
    const nav = useNavigate()
    const [searchParams] = useSearchParams()
    const courseId = searchParams.get('course_id')
    const [isLoading, setIsLoading] = useState(true)
    const [topicList, setTopicList] = useState<CreatedTopic[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isCreating, setIsCreating] = useState<"creating" | 'created' | false>(false)
    const searchedTopics = useTopicSearch(topicList, searchQuery)

    if (!courseId) {
        nav('/courses')
        return null
    }

    const navigateToTopic = (topicId: number, toEdit: boolean = false) => {
        nav(`${toEdit ? "/edit/topic" : "/topic"}?topic_id=${topicId}&course_id=${courseId}`)
    }

    const handleCreateTopic = () => {
        const titleInput = document.getElementById("topic-title-input") as HTMLInputElement
        const descInput = document.getElementById("topic-desc-input") as HTMLInputElement
        const title = titleInput.value.trim()
        const description = descInput.value.trim()
        
        if (title.length < 3) {
            toast.error("Название должно содержать минимум 3 символа")
            return
        }

        if (description.length < 3) {
            toast.error("Описание должно содержать минимум 3 символа")
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
                toast.error('Тема с таким названием уже существует')
            } else {
                toast.error('Ошибка при создании темы')
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
            toast.success('Тема успешно создана')
            setIsCreating(false)
        }
    }, [isCreating])

    if (isLoading) {
        return <Loader /> 
    }

    return (
        <div className="teacher-portal">
            <ToastContainer theme='dark' style={{top: "250px", marginLeft: 'auto', right: '100px'}} position='top-right' /> 

            <div style={{position: 'sticky'}} className="courses-search-container">
                <search>
                    <input
                        type="text"
                        placeholder="Поиск по названию темы..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.currentTarget.value)}
                        className="courses-search-input"
                    />
                    <span className="search-icon">🔍</span>
                </search>

                {searchQuery.length > 0 && 
                    <section className="search-variants-section">
                        {searchedTopics.length ? 
                            searchedTopics.map(topic => 
                                <div 
                                key={topic.id} 
                                onClick={() => navigateToTopic(topic.id)} 
                                className="search-list-param"
                                >
                                    <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="currentColor" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    width="24" 
                                    focusable="false" 
                                    aria-hidden="true"
                                    >
                                        <path 
                                        clipRule="evenodd" 
                                        d="M16.296 16.996a8 8 0 11.707-.708l3.909 
                                        3.91-.707.707-3.909-3.909zM18 11a7 7 0 
                                        00-14 0 7 7 0 1014 0z" 
                                        fillRule="evenodd"
                                        />
                                    </svg>

                                    <span 
                                    className="search-variants"
                                    >
                                        <span 
                                        style={{
                                            marginRight: '10px',
                                            color: "#2196F3",
                                            fontSize: '1.1rem'
                                        }}>
                                            {topic.title}
                                        </span>
                                    </span>
                                </div>
                            ) :
                            <span>Ничего не найдено</span>
                        }
                    </section>
                }
            </div>

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
                    {topicList.map(topic => 
                        <TopicElement 
                            key={topic.id}
                            topic={topic} 
                            loadingSetter={setIsLoading}
                            navigate={navigateToTopic}
                        />
                    )}
                </div> 
                : <p className="no-courses-message">Нет созданных тем</p>
            }
        </div>
    )
}

const TopicElement = ({ 
    topic, 
    loadingSetter, 
    navigate, 
}: {
    topic, 
    loadingSetter: Dispatch<SetStateAction<boolean>>, 
    navigate: (topicId: number, toEdit?: boolean) => void,
}) => {
    return (
        <div className={`course-card ${!topic.is_active ? 'archived' : ''}`}>
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
                    <button onClick={() => navigate(topic.id, true)}>
                        Перейти к теме
                    </button>
            </div>
        </div>
    )
}