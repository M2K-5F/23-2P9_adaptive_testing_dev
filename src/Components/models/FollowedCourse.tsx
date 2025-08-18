import { useState, useEffect, memo, FC } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CreatedCourse, UserCourse, UserTopic } from "../../types/interfaces"
import { Button, Badge } from "@/Components"
import clsx from "clsx"
import { getTopics } from "@/services/api.service"
import { useTopicStore } from "@/stores/useTopicStore"
import { routes } from "@/config/routes.config"
import { Check, X } from "lucide-react"

export const FollowedCourse: FC<{userCourse: UserCourse}> = memo(({userCourse}) => {
    const navigate = useNavigate()
    const fetchTopics = useTopicStore(s => s.fetchFollowedTopics)
    const topics = useTopicStore(s => s.followedTopics[userCourse.id])
    const [params, setParams] = useSearchParams()
    const expandedCourse = Number(params.get('expanded'))
    const isExpanded = expandedCourse === userCourse.id
    
    const handleExpand = () => {
        navigate(`/course?course_id=${userCourse.id}&expanded=${isExpanded ? '0' : userCourse.id}`)
    }

    useEffect(() => {
        isExpanded && fetchTopics(userCourse.id)
    }, [isExpanded])

    return (
        <article className={clsx(
            `border border-foreground overflow-hidden`,
            'rounded-lg shadow-sm mb-4 min-h-41 h-fit',
            'col-span-2',
            isExpanded && 'col-span-3',
            !userCourse.course.is_active &&  'opacity-70'
        )}>
            <section className="p-4 bg-muted">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium cursor-pointer" onClick={handleExpand}>
                        {userCourse.course.title}
                    </h3>

                    <Badge 
                        variant={userCourse.is_active ? 'default' : 'outline'}
                    >
                        {userCourse.is_active ? 'Активный' : 'Заблокирован'}
                    </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                    Автор: {userCourse.course.created_by}
                </p>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">Прогресс:</span>
                    <Badge variant="secondary">
                        {Math.round(userCourse.course_progress)}%
                    </Badge>
                </div>

                <Button
                    variant={isExpanded ? "destructive" : "default"}
                    size="sm"
                    onClick={() => {
                        setParams(p => {
                            p.set('expanded', `${isExpanded ? 0 : userCourse.id}`)
                            return p
                        })
                    }}
                >
                    {isExpanded ? 'Свернуть курс' : 'Перейти к курсу'}
                </Button>
            </section>

            {isExpanded && 
                <section className="border-t p-4 bg-muted/50">
                    <h4 className="text-md font-medium mb-3">Темы курса:</h4>

                    {topics?.length 
                        ?   <div className={clsx('scrollbar-hidden max-h-50 overflow-y-scroll')} >
                                {topics.map((topic, index) => (
                                    <div key={topic.id} className="flex flex-col items-center scrollb">
                                        {index > 0 && (
                                            <div className="text-4xl text-foreground/50">
                                                ↓
                                            </div>
                                        )}
                                        <div className="w-full p-3 border rounded-lg">
                                            <h5 className="font-medium">{topic.topic.title}</h5>
                                            <p className="text-sm text-muted-foreground">
                                                {topic.topic.description || "Нет описания"}
                                            </p>
                                            <span>{topic.topic.question_count ? `Количество вопросов: ${topic.topic.question_count}` : 'Нет созданных вопросов'}</span>
                                            {topic.topic_progress > 0 && (topic.is_completed 
                                                ?   <Badge variant='default' className= "border-green-500 mt-2 block border p-0 pr-2">
                                                        <Badge variant='outline' className="scale-105 gap-1 h-full border-none bg-green-500 mr-2">
                                                            <Check className="h-3 w-3" />
                                                            Пройдено
                                                        </Badge>
                                                        Баллы: {topic.topic_progress.toFixed(1)}/1
                                                    </Badge>
                                                :   <Badge variant='default' className= "border-red-500 block mt-2 border p-0 pr-2">
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

                        :   <p className="text-sm text-muted-foreground m-2.5">
                                Нет доступных тем
                            </p>
                    }

                    <Button 
                        variant='default'
                        className="mt-3 w-full"
                        onClick={() => navigate(routes.viewCourse(userCourse.course.id))}
                    >
                        {userCourse.course_progress > 0 ? 'Продолжить прохождение' : 'Начать прохождение'}
                    </Button>
                </section>
            }
        </article>
    )
})