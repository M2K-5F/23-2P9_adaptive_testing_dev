import { useState, useEffect, memo, FC } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CreatedCourse, UserCourse, UserTopic } from "../../types/interfaces"
import { Button, Badge, Progress, Skeleton } from "@/Components"
import clsx from "clsx"
import { getTopics } from "@/services/api.service"
import { useTopicStore } from "@/stores/useTopicStore"
import { routes } from "@/config/routes.config"
import { 
  Check, 
  X, 
  BookOpen, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Play,
  Award,
  BarChart3,
  Calendar,
  Clock,
  Star,
  Lock,
  Unlock
} from "lucide-react"

export const FollowedCourse: FC<{userCourse: UserCourse}> = memo(({userCourse}) => {
    const navigate = useNavigate()
    const fetchTopics = useTopicStore(s => s.fetchFollowedTopics)
    const topics = useTopicStore(s => s.followedTopics[userCourse.id])
    const [params, setParams] = useSearchParams()
    const expandedCourse = Number(params.get('expanded'))
    const isExpanded = expandedCourse === userCourse.id
    const [isLoading, setIsLoading] = useState(false)
    
    const handleExpand = () => {
        navigate(`/course?course_id=${userCourse.id}&expanded=${isExpanded ? '0' : userCourse.id}`)
    }

    useEffect(() => {
        if (isExpanded) {
            setIsLoading(true)
            fetchTopics(userCourse.id)
                .finally(() => setIsLoading(false))
        }
    }, [isExpanded])

    return (
        <article className={clsx(
            `border border-border overflow-hidden transition-all duration-300`,
            'rounded-xl shadow-sm mb-4 min-h-41 h-fit bg-card w-full col-span-2',
            isExpanded && 'sm:col-span-3 shadow-md',
            !userCourse.course.is_active &&  'opacity-70'
        )}>
            <section className="p-5 bg-gradient-to-r from-card to-card/80">
                <div className="flex justify-between items-start mb-3">
                    <div 
                        onClick={() => navigate(routes.viewCourse(userCourse.course.id))} 
                        className="flex cursor-pointer items-start gap-3 flex-1"
                    >
                        <div className="p-2 bg-primary/10 rounded-lg mt-1">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 
                                className='
                                    text-lg font-semibold cursor-pointer 
                                    hover:text-primary transition-colors'
                            >
                                {userCourse.course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                Автор: {userCourse.course.created_by.name}
                            </p>
                        </div>
                    </div>

                    <Badge 
                        variant={userCourse.is_active ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                    >
                        {userCourse.is_active 
                            ?   <>
                                    <Unlock className="h-3.5 w-3.5" />
                                    Активный
                                </>
                            :   <>
                                    <Lock className="h-3.5 w-3.5" />
                                    Заблокирован
                                </>
                        }
                    </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-sm bg-secondary/20 px-2 py-1 rounded-full">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Прогресс: {Math.round(userCourse.course_progress)}%</span>
                    </div>
                    
                    {userCourse.course_progress > 0 && (
                        <div className="flex items-center gap-1 text-sm bg-green-500/20 px-2 py-1 rounded-full text-green-700">
                            <Award className="h-3.5 w-3.5" />
                            <span>{userCourse.course_progress === 100 ? 'Завершен' : 'Начат'}</span>
                        </div>
                    )}
                </div>
                <Progress offsetValue={2}
                    className="mt-3"
                    value={userCourse.course_progress}
                />

                <Button
                    variant={"default"}
                    size="sm"
                    onClick={() => {
                        setParams(p => {
                            p.set('expanded', `${isExpanded ? 0 : userCourse.id}`)
                            return p
                        })
                    }}
                    id="expandCourseBtn"
                    className="mt-4 flex items-center gap-2 w-full sm:w-auto"
                >   
                    <ChevronUp className={clsx("h-4 w-4 transition-all", isExpanded && 'rotate-180')} />
                    {isExpanded ? 'Свернуть курс' : 'Подробнее'}
                </Button>
            </section>

            {isExpanded && 
                <section className="border-t p-5 bg-muted/20">
                    <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Темы курса
                    </h4>

                    {isLoading 
                        ?   <div className='grid grid-cols-2 gap-2'>
                                <Skeleton  className="h-20"/>
                                <Skeleton  className="h-20"/>
                            </div>
                        :   topics?.length 
                            ?   <div className={clsx('scrollbar-hidden max-h-65 overflow-y-auto space-y-4')}>
                                    {topics.map((topic, index) => (
                                        <div key={topic.id} className="flex flex-col items-center">
                                            {index > 0 && 
                                                <div className="text-3xl text-foreground/30 my-2">
                                                    ↓
                                                </div>
                                            }
                                            <div className="w-full p-4 border rounded-lg bg-background hover:shadow-md transition-shadow">
                                                <h5 className="font-medium mb-2">{topic.topic.title}</h5>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {topic.topic.description || "Нет описания"}
                                                </p>
                                                
                                                <div className="flex items-center gap-2 text-sm mb-3">
                                                    <span className="bg-secondary px-2 py-1 rounded-md">
                                                        Вопросов: {topic.topic.question_count || 0}
                                                    </span>
                                                </div>
                                                
                                                {topic.topic_progress > 0 && (topic.is_completed 
                                                    ?   <Badge variant='default' className="border-green-500 mt-2 block border p-0 pr-2">
                                                            <Badge variant='outline' className="scale-105 gap-1 h-full border-none bg-green-500 mr-2">
                                                                <Check className="h-3 w-3" />
                                                                Пройдено
                                                            </Badge>
                                                            Баллы: {topic.topic_progress.toFixed(1)}/1
                                                        </Badge>
                                                    :   <Badge variant='default' className="border-red-500 block mt-2 border p-0 pr-2">
                                                            <Badge variant='outline' className="scale-105 gap-1 h-full border-none bg-red-500 mr-2">
                                                                <X className="h-3 w-3" />
                                                                Не пройдено
                                                            </Badge>
                                                            Баллы: {topic.topic_progress.toFixed(1)}/1
                                                        </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            :   <p className="text-sm text-muted-foreground py-4 text-center">
                                    Нет доступных тем
                                </p>
                    }

                    <Button 
                        variant='default'
                        className="mt-4 w-full flex items-center gap-2"
                        onClick={() => navigate(routes.viewCourse(userCourse.course.id))}
                    >
                        <Play className="h-4 w-4" />
                        {userCourse.course_progress > 0 ? 'Продолжить прохождение' : 'Начать прохождение'}
                    </Button>
                </section>
            }
        </article>
    )
})