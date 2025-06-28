import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { archCourse, createCourse, getCourses, getFollowedCourses } from "../services/api.service";
import { DraftFunction, Updater, useImmer } from "use-immer";
import { CreatedCourse, FollowedCourse } from "../types/interfaces";
import { Loader } from '../Components/Loader'
import { debounce } from "../utils/debounce";
import { toast, ToastContainer } from "react-toastify";
import {useCourseSearch} from '../hooks/useCourseSearch'
import { SearchElement } from "../Components/SearchElement";
import { userStore } from "../stores/userStore";


export default function TeacherPortal() {
    const nav = useNavigate()
    const {nick} = userStore()
    const [isLoading, setIsLoading] = useState(true)
    const [courseList, setCourseList] = useImmer<[CreatedCourse[], FollowedCourse[]]>([[], []])
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [isCreating, setIsCreating] = useState<"creating" | 'created' | false>(false)
    // const debouncedSetSearchQuery = useRef(debounce((value: string) => console.log('timer'), 500))
    const searchedCourses = useCourseSearch(courseList[0], courseList[1], searchQuery)

    const navigateToCourse = (courseID: number, toEdit: boolean = false) => {
        nav(`${ toEdit ? "/edit/course" : "/course"}?course_id=${courseID}`)
    }

    const handleCreateCourse = () => {
        const input = document.getElementById("course-title-input") as HTMLInputElement
        const title = input.value.trim()
        
        if (title.length < 3) {
            toast.error("Название должно содержать минимум 3 символа")
            return
        }

        createCourse(title)
        .then(() => {
            setIsLoading(true)
            setIsCreating('created')
            input.value = ""
        })
        .catch((error: Error) => {
            if (error.message === "400") {
                toast.error('Курс с таким названием уже существует')
            } else {
                toast.error('Ошибка при создании курса')
            }
        })
    }


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
            .catch(error => {
                console.log(error);
                
            })
            .finally(() => setIsLoading(false))
        }
    }, [isLoading])

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
                            searchedCourses.map( course => 
                                <SearchElement course={course} navigate={navigateToCourse} navigateToEdit={course.created_by === nick}/>
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
                            <input 
                            id="course-title-input" 
                            style={{
                                color:"black", 
                                marginRight: '5px', 
                                backgroundColor: 'white', 
                                caretColor: "black"
                            }}
                            placeholder="Название курса" 
                            className="create-course-btn"
                            />

                            <button 
                            className="create-course-btn" 
                            onClick={() => handleCreateCourse()}
                            style={{marginRight: '5px'}}>
                                ✔
                            </button>
                        </>
                    }
                    <button 
                    className="create-course-btn"  
                    onClick={() => 
                        setIsCreating(isCreating === 'creating' ? false : 'creating'
                    )}>{
                        isCreating ? "- отменить создание" : "+ Создать новый курс"
                    }</button>
                </div>
            </header>


            {
                courseList[0].length > 0 
                    ? <div className="courses-flex">
                        {
                            courseList?.[0].map(course => 
                                <CourseElement 
                                key={course.id}
                                course={course} 
                                loadingSetter={setIsLoading}
                                navigate={navigateToCourse}
                                />
                            )
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
                            courseList?.[1].map(userCourse => 
                                <CourseElement
                                key={userCourse.course.id}
                                course={userCourse.course}
                                loadingSetter={setIsLoading}
                                navigate={navigateToCourse}
                                courseProgress={userCourse.course_progress}
                                />
                            )
                        }
                    </div>
                    : <p className="no-courses-message">Нет доступных курсов для прохождения</p>
            }
    </div>
    )
}

const CourseElement = ({ course, loadingSetter, navigate, courseProgress } : 
    {
        course: CreatedCourse, 
        loadingSetter: Dispatch<SetStateAction<boolean>>, 
        navigate: (courseID: number, toEdit?: boolean) => void, 
        courseProgress?: number
    }
) => {
    return (
        <div key={course.title} className={`course-card ${!course.is_active ? 'archived' : ''}`}>
            <div className="course-header">
                <h3>{course.title}</h3>
                {typeof courseProgress !== 'number' && 
                <button
                onClick={() => {
                    archCourse(course.id)
                    .then(() => {
                        loadingSetter(true)
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
                    typeof courseProgress === 'number' ? 
                        <span key={course.id} className="active">{courseProgress * 100}%</span> 
                        :
                        course.is_active ? 
                            <span key={course.id} className="active">Активный</span>
                            : 
                            <span key={course.id} className="archived">В архиве</span>
                        
                }
            </div>
            <div className="course-actions">
                {typeof courseProgress !== 'number' ? 
                    <button 
                    key={course.id}
                    onClick={() => navigate(course.id, true)                        
                    }>
                        Перейти к курсу
                    </button>
                    :
                    course.is_active ? 
                        <button 
                        key={course.id} 
                        onClick={() => navigate(course.id)
                        }>
                            Перейти к прохождению курса
                        </button> 
                        :
                        <span 
                        key={course.id}
                        className="locked"
                        >
                            Курс заблокирован для прохождения
                        </span>
                }
            </div>
        </div>
    )
}