import { redirect, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { getFollowedCourses, getSearchedCourses } from "../../services/api.service";
import { CreatedCourse, FollowedCourse } from "../../types/interfaces";
import { Loader } from '../../Components/Loader'
import { ToastContainer } from "react-toastify";
import { userStore } from "../../stores/userStore";
import { SearchContainer } from "../../Components/SearchContainer";
import { CourseElement } from "./Components/CourseElement";


export default function TeacherPortal() {
    const nav = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [courseList, setCourseList] = useState<FollowedCourse[]>([])

    const navigateToCourse = (courseID: number) => {
        nav(`/course?course_id=${courseID}`)
    }

    useEffect(() => {
        if (!isLoading) return
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
            
            <SearchContainer
            placeholder="Поиск по названию курса..."
            searchfn={(query, callback) => {
                getSearchedCourses(query)
                .then((data: CreatedCourse[]) => {
                    callback(data)
                })
            }}
            handlefn={(course) => navigateToCourse(course.id)} 
            summary={{name: 'Создан: ', content: 'created_by'}}
            />

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

