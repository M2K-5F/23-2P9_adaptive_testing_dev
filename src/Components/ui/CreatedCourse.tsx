import { Dispatch, FC, SetStateAction } from "react"
import { CreatedCourse as CC } from "../../types/interfaces"
import { archCourse } from "../../services/api.service"
import { useNavigate } from "react-router-dom"
import { Button } from "@/Components/ui/button"
import { useCourseStore } from "@/stores/useCourseStore"
import clsx from "clsx"
import { Badge } from "@/Components/ui/badge"

export const CreatedCourse: FC<{course: CC}> = ({course}) => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const navigate = useNavigate()

    const handleArchTopic = () => {
            archCourse(course.id)
            .then(() => {fetchCourses()})
    }


    return (
        <div className={clsx(
            `border border-foreground overflow-hidden`,
            'rounded-lg shadow-sm p-4 bg-muted min-h-42',
            !course.is_active &&  'opacity-70'
        )}>
            <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium cursor-pointer">
                        {course.title}
                    </h3>

                    <Button
                        variant='outline'
                        size="sm"
                        onClick={() => {handleArchTopic()}}
                        title={course.is_active ? 'Архивировать' : 'Разархивировать'}
                    >
                        {course.is_active ? '🗄️' : '📦'}
                    </Button>
                </div>
            <p className={clsx(
                "text-sm text-wrap text-muted-foreground",
                'wrap-break-word mb-2'
            )}>Автор: {course.created_by}</p>
            <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">Статус:</span>
                    <Badge 
                        className="cursor-pointer" 
                        onClick={() => handleArchTopic()} 
                        variant={course.is_active ? 'default' : 'outline'}
                        >{
                            course.is_active ? 'Активный' : 'В архиве'
                        }</Badge>
                </div>
            <Button 
                key={course.id}
                onClick={() => navigate(`/edit/course?course_id=${course.id}`)                        
                }>
                    Перейти к курсу
            </Button>
        </div>
    )
}