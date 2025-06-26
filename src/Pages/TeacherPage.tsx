import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "../Components/Button";
import {WaitModal} from '../Components/WaitModal'
import { archCourse, createCourse, getCourses, getFollowedCourses } from "../services/api.service";
import { DraftFunction, Updater, useImmer } from "use-immer";
import { modal } from "../types/types";
import { CreatedCourse, FollowedCourse } from "../types/interfaces";
import { Loader } from '../Components/Loader'
import { debounce } from "../utils/debounce";
import { toast, ToastContainer } from "react-toastify";


export default function TeacherPortal() {
    const nav = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [courseList, setCourseList] = useImmer<[CreatedCourse[], FollowedCourse[], CreatedCourse[]]>([[], [], []])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isCreating, setIsCreating] = useState<"creating" | 'created' | false>(false)
    const debFunc = useRef(debounce(() => console.log('timer'), 500))

    const navigateToCourse = (courseID: Number, toEdit: boolean = false) => {
        nav(`${ toEdit ? "/edit/course" : "/course"}?course_id=${courseID}`)
    }

    const searchedCourses = searchQuery.length > 0 ? [
        ...courseList[0].filter((course) => 
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            course.created_by.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...[...courseList[1].filter((course) => 
            course.course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            course.course.created_by.toLowerCase().includes(searchQuery.toLowerCase())
        )].map((course) => course.course)
    ] : []
    

    useLayoutEffect(() => {
        if (isLoading === true) {
            Promise.all([
                getCourses(),
                getFollowedCourses()
            ])
            .then(data => {
                setCourseList(draft => {
                    draft[0] = data[0]
                    draft[1] = data[1]
                })
            })
            .finally(() => setIsLoading(false))
        }
    }, [isLoading])
    
    useLayoutEffect(() => {
        if (searchQuery.length > 0) {
            debFunc.current!()
        }
    }, [searchQuery])

    useEffect(() => { if (isCreating === 'created') {
        toast.success('Курс успешно создан')
        setIsCreating(false)
    }}
    , [isCreating])


    if (isLoading) {
        return <Loader /> 
    }
    return (
        <div className="teacher-portal">
            <ToastContainer theme='dark' style={{top: "250px",marginLeft: 'auto', right: '100px'}} position='top-right' /> 
            <div style={{position: 'sticky'}} className="courses-search-container">
                <search>
                    <input
                        type="text"
                        placeholder="Поиск по названию или автору..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.currentTarget.value)}
                        className="courses-search-input"
                    />
                    <span className="search-icon">🔍</span>
                </search>
                {searchQuery.length > 0 && 
                    <section className="search-variants-section">
                        {searchedCourses.length ? 
                            searchedCourses.map(course => 
                                <div key={course.id} onClick={() => {navigateToCourse(course.id)}} className="search-list-param">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" ><path clip-rule="evenodd" d="M16.296 16.996a8 8 0 11.707-.708l3.909 3.91-.707.707-3.909-3.909zM18 11a7 7 0 00-14 0 7 7 0 1014 0z" fill-rule="evenodd"></path></svg>
                                    <span key={course.id} className="search-variants" >
                                        <span style={{marginRight: '10px',color: "#2196F3", fontSize: '1.1rem'}}>{course.title}</span>
                                        создан:
                                        <span style={{marginLeft: '5px',color: "#4CAF50", fontSize: '1.1rem'}}>{course.created_by}</span>
                                    </span>
                                </div>
                            ) :
                            <span>Ничего не найдено</span>
                        }
                    </section>
                }
            </div>

            <header className="portal-header">
                <h1>Курсы созданные мной</h1>
                <div style={{position: 'relative'}}>
                    {
                        isCreating === 'creating' &&
                        <>
                            <input min={3} id="course-title-input" style={{color:"black", marginRight: '5px', backgroundColor: 'white', caretColor: "black"}} placeholder="Название курса" className="create-course-btn"></input>
                            <button 
                            className="create-course-btn" 
                            onClick={() => {
                                const value = (document.getElementById("course-title-input")as HTMLInputElement).value
                                if (value.length > 2) {
                                    createCourse(value)
                                    .then(() => {
                                                setIsLoading(true)
                                                setIsCreating('created')
                                    })
                                    .catch((error: Error) => {
                                        switch (Number(error.message)) {
                                            case 400:
                                                toast.error('Вы уже создали курс с таким названием!')
                                        }
                                    })
                                } else {toast.error("Недопустимая длина!")}
                            }} 
                            style={{marginRight: '5px'}}>✔</button>
                        </>
                    }
                    <button className="create-course-btn"  onClick={() => setIsCreating(isCreating === 'creating' ? false : 'creating')} >{ isCreating ? "- отменить создание" : "+ Создать новый курс"}</button>
                </div>
            </header>

            {
                courseList[0].length > 0 
                    ? <div className="courses-flex">
                        {
                            courseList?.[0].map(course => (
                                courseElemeent(course, setIsLoading, navigateToCourse)
                            ))
                        }
                        </div> 
                    : <p className="no-courses-message">Нет созданных курсов</p>
            }

            <header className="portal-header">
                <h1>Мои курсы</h1>
            </header>
            
            {
                courseList[1].length > 0
                    ? <div className="courses-flex">
                        {
                            courseList?.[1].map(userCourse => (
                                courseElemeent(userCourse.course, setIsLoading, navigateToCourse, userCourse.course_progress)
                            ))
                        }
                    </div>
                    : <p className="no-courses-message">Нет доступных курсов для прохождения</p>
            }
    </div>
    )
}

const courseElemeent = (
    course: CreatedCourse, 
    setter: Dispatch<SetStateAction<boolean>>, 
    navigate: (courseID: Number, toEdit?: boolean) => void, 
    courseProgress?: number
) => {
    return (
        <div key={course.title} className={`course-card ${!course.is_active ? 'archived' : ''}`}>
            <div className="course-header">
                <h3>{course.title}</h3>
                {typeof courseProgress !== 'number' && <button
                    onClick={() => {
                        archCourse(course.id)
                        .then(() => {
                            setter(true)
                        })
                    }}
                    className="archive-btn"
                    title={course.is_active ? 'Архивировать' : 'Разархивировать'}
                >
                    {course.is_active ? '🗄️' : '📦'}
                </button>}
            </div>
            <p>Автор: {course.created_by}</p>
            <div className="course-status">
                {
                    typeof courseProgress === "number" ? "Прогресс прохождения: " : "Cтатус: "
                }
                {
                    typeof courseProgress === 'number' 
                    ? <span className="active">{courseProgress * 100}%</span>
                    :[course.is_active 
                        ? <span className="active">Активный</span>
                        : <span className="archived">В архиве</span>
                    ]
                }
            </div>
            <div className="course-actions">
                {typeof courseProgress === 'number' 
                    ? [ course.is_active 
                            ? <button onClick={() => navigate(course.id)}>Перейти к прохождению курса</button>
                            : <span className="locked">Курс заблокирован для прохождения</span>]
                    : <button onClick={() => navigate(course.id, true)}>Перейти к курсу</button>}
            </div>
        </div>
    )
}