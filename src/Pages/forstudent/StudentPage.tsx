import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { archCourse, createCourse, getCourses, getFollowedCourses } from "../../services/api.service";
import { DraftFunction, Updater, useImmer } from "use-immer";
import { CreatedCourse, FollowedCourse } from "../../types/interfaces";
import { Loader } from '../../Components/Loader'
import { debounce } from "../../utils/debounce";
import { toast, ToastContainer } from "react-toastify";
import {useCourseSearch} from '../../hooks/useCourseSearch'
import { SearchElement } from "../../Components/SearchElement";
import { userStore } from "../../stores/userStore";


export default function TeacherPortal() {
    const nav = useNavigate()
    const {nick} = userStore()
    const [isLoading, setIsLoading] = useState(true)
    const [courseList, setCourseList] = useImmer<FollowedCourse[]>([])
    const [searchQuery, setSearchQuery] = useState<string>("")
    // const debouncedSetSearchQuery = useRef(debounce((value: string) => console.log('timer'), 500))
    const searchedCourses = useCourseSearch([], courseList, searchQuery)

    const navigateToCourse = (courseID: number) => {
        nav(`/course?course_id=${courseID}`)
    }

    useEffect(() => {
        if (isLoading)
            getFollowedCourses()
            .then((data: FollowedCourse[]) => {
                setCourseList(data)
            })
            .finally(() => setIsLoading(false))
    })

    if (isLoading) {
        return <Loader /> 
    }

    return (
        <div className="teacher-portal">
            <ToastContainer theme='dark' style={{top: "250px",marginLeft: 'auto', right: '100px'}} position='top-right' /> 

            <search style={{position: 'sticky'}} className="courses-search-container">
                <search>
                    <input
                        max={60}
                        type="text"
                        placeholder="Найти курс для прохождения"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.currentTarget.value)}
                        className="courses-search-input"
                    />
                    <span className="search-icon">🔍</span>
                </search>

                {searchQuery.length > 0 && 
                    <section className="search-variants-section">
                        {searchedCourses.length 
                            ?   searchedCourses.map( course => 
                                    <SearchElement course={course} callbackfn={(args) => navigateToCourse(course.id)} />
                                ) 
                            :   <span>Ничего не найдено</span>
                        }
                    </section>
                }
            </search>
            
            <header className="portal-header">
                <h1>Мои курсы</h1>
            </header>
            

            {courseList.length > 0
                ?   <div className="courses-flex">
                        {courseList.map(userCourse => 
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
                :   <p className="no-courses-message">Нет доступных курсов для прохождения</p>
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