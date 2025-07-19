import { CreatedCourse } from "../../../types/interfaces"
import { Dispatch, SetStateAction } from "react"
import { archCourse } from "../../../services/api.service"
import { useHomeStore } from "../stores/homeStore"
import { useNavigate } from "react-router-dom"

export const FollowedCourseElement = ({ course, courseProgress } : 
    {
        course: CreatedCourse,
        courseProgress: number
    }
) => {
    const {init} = useHomeStore()
    const navigate = useNavigate()
    return (
        <div key={course.title} className={`course-card ${!course.is_active ? 'archived' : ''}`}>
            <div className="course-header">
                <h3>{course.title}</h3>
            </div>
            <p>Автор: {course.created_by}</p>
            <div className="course-status">
                Прогресс прохождения: <span key={course.id} className="active">{courseProgress * 100}%</span> 
            </div>
            <div className="course-actions">
                {course.is_active 
                    ?   <button 
                        key={course.id} 
                        onClick={() => navigate(`/course?course_id=${course.id}`)
                        }>
                            Перейти к прохождению курса
                        </button> 

                    :   <span 
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