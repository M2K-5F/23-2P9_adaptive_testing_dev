import { Dispatch, SetStateAction } from "react"
import { CreatedCourse } from "../../../types/interfaces"
import { archCourse } from "../../../services/api.service"
import { useHomeStore } from "../stores/homeStore"
import { useNavigate } from "react-router-dom"

export const CreatedCourseElement = ({ course } : 
    {
        course: CreatedCourse
    }
) => {
    const {init} = useHomeStore()
    const navigate = useNavigate()
    return (
        <div key={course.title} className={`course-card ${!course.is_active ? 'archived' : ''}`}>
            <div className="course-header">
                <h3>{course.title}</h3> 
                <button
                onClick={() => {
                    archCourse(course.id)
                    .then(() => {
                        init()
                    })
                }}
                className="archive-btn"
                title={course.is_active ? 'Архивировать' : 'Разархивировать'}
                >
                    {course.is_active ? '🗄️' : '📦'}
                </button>
            </div>
            <p>Автор: {course.created_by}</p>
            <div className="course-status">
                Cтатус: {course.is_active 
                    ?   <span key={course.id} className="active">Активный</span>
                    :   <span key={course.id} className="archived">В архиве</span>
                }
            </div>
            <div className="course-actions"> 
                <button 
                key={course.id}
                onClick={() => navigate(`/edit/course?course_id=${course.id}`)                        
                }>
                    Перейти к курсу
                </button>
            </div>
        </div>
    )
}