import { Dispatch, FC, SetStateAction } from "react"
import { CreatedCourse as CC } from "../../types/interfaces"
import { archCourse } from "../../services/api.service"
import { useNavigate } from "react-router-dom"
import { Button } from "@/Components/ui/button"
import { useCourseStore } from "@/stores/useCourseStore"
import clsx from "clsx"
import { Badge } from "@/Components/ui/badge"
import { 
  BookOpen, 
  Clock, 
  Users, 
  Archive, 
  ArchiveRestore, 
  Edit3, 
  BarChart3, 
  Calendar,
  User,
  ChevronRight
} from "lucide-react"

export const CreatedCourse: FC<{course: CC}> = ({course}) => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const navigate = useNavigate()

    const handleArchTopic = () => {
            archCourse(course.id)
            .then(() => {fetchCourses()})
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    return (
        <div className={clsx(
            `border border-foreground/20 overflow-hidden`,
            'rounded-xl shadow-sm p-5 bg-card h-fit transition-all',
            'hover:shadow-md hover:border-foreground/30',
            !course.is_active &&  'opacity-70 bg-muted/50'
        )}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                        <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold cursor-pointer line-clamp-2">
                            {course.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>Автор: {course.created_by.name}</span>
                        </div>
                    </div>
                </div>

                <Button
                    variant='outline'
                    size="sm"
                    onClick={() => {handleArchTopic()}}
                    title={course.is_active ? 'Архивировать' : 'Разархивировать'}
                    className="h-8 w-8 p-0"
                >
                    {course.is_active ? 
                        <Archive className="h-4 w-4" /> : 
                        <ArchiveRestore className="h-4 w-4" />
                    }
                </Button>
            </div>
            
            <p className={clsx(
                "text-sm text-wrap text-muted-foreground mb-3 line-clamp-3",
            )}>
                {course.description || "Описание курса отсутствует. Вы можете добавить его в редакторе курса."}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center gap-1 text-xs bg-secondary/20 px-2 py-1 rounded-full">
                    <BarChart3 className="h-3 w-3" />
                    <span>Тем: {course.topic_count || 0}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs bg-secondary/20 px-2 py-1 rounded-full">
                    <Users className="h-3 w-3" />
                    <span>Студентов: {course.student_count || 0}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs bg-secondary/20 px-2 py-1 rounded-full">
                    <Calendar className="h-3 w-3" />
                    <span>Создан: {formatDate(course.created_at)}</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
                <Badge 
                    className="cursor-pointer flex items-center gap-1" 
                    onClick={() => handleArchTopic()} 
                    variant={course.is_active ? 'default' : 'outline'}
                >
                    {course.is_active 
                        ?   <>
                                <div className="h-2 w-2 rounded-full bg-background animate-pulse"></div>
                                Активный
                            </>
                        :   <>
                                <Archive className="h-3 w-3" />
                                В архиве
                            </>
                    }
                </Badge>
                
                <Button 
                    onClick={() => navigate(`/edit/course?course_id=${course.id}`)}
                    className="flex items-center gap-1"
                >
                    <Edit3 className="h-4 w-4" />
                    Редактировать
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}