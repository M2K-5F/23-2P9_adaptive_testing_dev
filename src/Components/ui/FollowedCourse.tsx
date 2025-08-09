import { CreatedCourse } from "../../types/interfaces"
import { Dispatch, FC, SetStateAction } from "react"
import { archCourse } from "../../services/api.service"
import { useNavigate } from "react-router-dom"
import clsx from "clsx"

export const FollowedCourse: FC<{course: CreatedCourse,courseProgress: number}> = ({course, courseProgress}) => {
    const navigate = useNavigate()
    return (
        <div className={clsx(
            `border border-foreground overflow-hidden`,
            'rounded-lg shadow-sm mb-4',
            !course.is_active &&  'opacity-70'
        )}>
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