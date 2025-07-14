import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { archCourse, createCourse, getCourses, getFollowedCourses } from "../../services/api.service";
import { DraftFunction, Updater, useImmer } from "use-immer";
import { CreatedCourse, FollowedCourse } from "../../types/interfaces";
import { Loader } from '../../Components/Loader'
import {SearchContainer} from '../../Components/SearchContainer'
import { toast, ToastContainer } from "react-toastify";
import { courseSearch } from '../../utils/courseSearch'
import { SearchElement } from "../../Components/SearchElement";
import { userStore } from "../../stores/userStore";
import { CourseElement } from "./Components/CourseElement";


export default function TeacherPortal() {
    const nav = useNavigate()
    const {nick} = userStore()
    const [isLoading, setIsLoading] = useState(true)
    const [courseList, setCourseList] = useImmer<[CreatedCourse[], FollowedCourse[]]>([[], []])
    const [isCreating, setIsCreating] = useState<"creating" | 'created' | false>(false)
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

            <SearchContainer 
            placeholder="Поиск по названию или автору..."
            searchfn={(query, callback) => callback(courseSearch(courseList[0], courseList[1], query, nick))}
            handlefn={(element) => navigateToCourse(element.id, element.created_by === nick)}
            summary={{name: 'Создан: ', content: 'created_by'}}
            /> 

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
                    style={ isCreating ? {backgroundColor: "red"} : {}}
                    onClick={() => 
                        setIsCreating(isCreating === 'creating' ? false : 'creating'
                    )}>{
                        isCreating ? "- отменить создание" : "+ Создать новый курс"
                    }</button>
                </div>
            </header>


            {courseList[0].length > 0 
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
            

            {courseList[1].length > 0
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