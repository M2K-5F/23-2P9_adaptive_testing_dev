import { Dispatch, SetStateAction } from "react"
import { CreatedCourse } from "../../../types/interfaces"
import { archCourse } from "../../../services/api.service"

export const CourseElement = ({ course, loadingSetter, navigate, courseProgress } : 
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