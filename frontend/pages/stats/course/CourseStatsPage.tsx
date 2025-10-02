import React, { useState, useEffect, FC, Fragment, createContext, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select, Badge, Progress, Skeleton, SelectItem, SelectContent, SelectTrigger, SelectValue, Loader, Button, DropdownMenuSeparator } from '@/components';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useCourseStore } from '@/stores/useCourseStore';
import { useClipboard } from '@/hooks/useClipboard';
import { CourseStatistics, GroupDetail, UserGroupDetail, UserTopicDetail } from '@/types/interfaces';
import { getCourseStats } from '@/services/api.service';
import { SubmitTextQuestionsDialog } from '@/components/dialogs/submit-question-dilog';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { QuestionWeightsDialog } from '@/components/dialogs/question-weight-dialog';


const fetchStatisticsCoxtext = createContext<() => void>(() => {})


export const CourseStatisticsPage: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const course_id = Number(searchParams.get('stats_course_id'))
    const [statistics, setStatistics] = useState<CourseStatistics | null>(null)
    const [loading, setLoading] = useState(false)
    const createdCourses = useCourseStore(s => s.createdCourses)
    const [error, setError] = useState<string | null>(null)
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    const fetchStatistics = async () => {
            setLoading(true)
            setError(null)
            try {   
                course_id && setStatistics(await getCourseStats(course_id))
            } catch {
                setError('Ошибка загрузки статистики')
            } finally {
                setLoading(false)
            }
    }

    const toggleGroup = (groupTitle: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(groupTitle)) {
                newSet.delete(groupTitle)
            } else {
                newSet.add(groupTitle)
            }
            return newSet
        })
    }

    const toggleAllGroups = () => {
        if (!statistics) return
        
        if (expandedGroups.size === statistics.group_details.length) {
            setExpandedGroups(new Set())
        } else {
            const allGroupTitles = new Set(statistics.group_details.map(group => group.title))
            setExpandedGroups(allGroupTitles)
        }
    }

    const isGroupExpanded = (groupTitle: string) => expandedGroups.has(groupTitle)


    useEffect(() => {
        fetchStatistics()
    }, [course_id])


    if (loading) return <Loader variant='success' />

    return (
        <fetchStatisticsCoxtext.Provider value={fetchStatistics} >
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex gap-2 items-center justify-between">
                    <h1 className="text-3xl max-sm:text-lg font-bold">Статистика курсов</h1>
                    
                    <Select onValueChange={(value) => setSearchParams(p => {
                        p.set('stats_course_id', `${value}`)
                        return p
                    })} value={course_id.toString()}>
                        <SelectTrigger className="w-fit">
                            <SelectValue placeholder="Выберите курс" />
                        </SelectTrigger>
                        <SelectContent>
                            {createdCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {error && (
                    <Card className="border-destructive">
                        <CardContent className="py-6">
                            <div className="text-destructive text-center">{error}</div>
                        </CardContent>
                    </Card>
                )}

                {statistics && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>{statistics.course_title}</CardTitle>
                                <CardDescription>Общая статистика по курсу</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{statistics.meta.total_students}</div>
                                        <div className="text-muted-foreground">Всего студентов</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{Math.round(statistics.meta.avg_progress * 100)}%</div>
                                        <div className="text-muted-foreground">Средний прогресс</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{statistics.meta.completed_user_groups}</div>
                                        <div className="text-muted-foreground">Завершивших групп</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {statistics.group_details.length > 0 && 
                            <div className="flex justify-end">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={toggleAllGroups}
                                    className="flex items-center gap-2"
                                >
                                    {expandedGroups.size === statistics.group_details.length 
                                        ?   <>
                                                <ChevronUpIcon className="h-4 w-4" />
                                                Свернуть все группы
                                            </>
                                        :   <>
                                                <ChevronDownIcon className="h-4 w-4" />
                                                Развернуть все группы
                                            </>
                                    }
                                </Button>
                            </div>
                        }

                        <div className="space-y-4">
                            {statistics.group_details.map((group) => {
                                const isExpanded = isGroupExpanded(group.title)

                                return (
                                    <GroupCard 
                                        key={group.title}
                                        group={group}
                                        isExpanded={isExpanded}
                                        toggleGroup={toggleGroup}
                                    />
                                )
                            })}
                        </div>

                        {statistics.group_details.length === 0 && 
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-muted-foreground">В курсе пока нет групп</p>
                                    <p className="text-sm text-muted-foreground">Создайте группы для организации студентов</p>
                                </CardContent>
                            </Card>
                        }
                    </>
                )}

                {!course_id && !loading && !error && (
                    <Card>
                        <CardContent className="py-6">
                            <div className="text-center text-muted-foreground">
                                Выберите курс для просмотра статистики
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </fetchStatisticsCoxtext.Provider>
    )
}


const GroupCard: FC<{group: GroupDetail, isExpanded: boolean, toggleGroup: (groupTitle: string) => void}> = ({group, isExpanded, toggleGroup}) => {
    const hasStudents = group.user_group_details.length > 0
    
    return(
        <Card key={group.title} className="overflow-hidden">
            <CardHeader className="cursor-pointer transition-colors p-4" 
                onClick={() => toggleGroup(group.title)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        {isExpanded 
                            ?   <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
                            :   <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
                        }
                        <div className='flex flex-wrap justify-start w-full items-center gap-4'>
                            <div className="flex-1">
                                <CardTitle className="text-lg flex items-baseline gap-3">
                                    {group.title}
                                    <Badge variant="secondary">
                                        {group.student_count}/{group.max_student_count} студентов
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Средний прогресс: {Math.round(group.avg_progress * 100)}%
                                    {!hasStudents && ' • Группа пустая'}
                                </CardDescription>
                            </div>
                            <div className={clsx('mr-4')} >
                                <QuestionWeightsDialog groupId={group.id}/>
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            {isExpanded && 
                <CardContent className="p-4 border-t">
                    {hasStudents 
                        ?   <div className="space-y-4">
                                {group.user_group_details.map((student) => (
                                    <UserGroupCard student={student} key={student.user.id} />
                                ))}
                            </div>
                        :   <div className="text-center py-8 text-muted-foreground">
                                <p>В этой группе еще нет студентов</p>
                                <p className="text-sm">Пригласите студентов присоединиться к группе</p>
                            </div>
                    }
                </CardContent>
            }
        </Card>
    )
}


const UserGroupCard: FC<{student: UserGroupDetail}> = ({student}) => {
    const copy = useClipboard()

    return (
        <Card key={student.user.id} className="p-4">
            <div className="flex flex-col justify-baseline items-start mb-4">
                <div className='flex justify-between w-full flex-row'>
                    <h3 className="font-semibold">{student.user.name}</h3>
                    <Badge variant={student.progress === 100 ? "default" : "secondary"}>
                        {Math.round(student.progress * 100)}%
                    </Badge>
                </div>
                <Button 
                    variant={'link'} 
                    onClick={() => copy(student.user.telegram_link)} 
                    className="p-0 text-sm text-muted-foreground"
                >
                    @{student.user.telegram_link.split('://')[1]}
                </Button>
            </div>

            <Progress offsetValue={2} value={student.progress * 100} />

            <div className="mt-3 text-sm text-muted-foreground">
                {student.completed_topics} из {student.total_topics} тем завершено
            </div>

            <div className="mt-4 space-y-2">
                {student.user_topic_details.map((topic, index) => (
                    <UserTopicCard index={index} topic={topic} key={topic.topic_title} />
                ))}
            </div>
        </Card>
    )
}


const UserTopicCard: FC<{topic: UserTopicDetail, index: number}> = ({topic, index}) => {
    const fetchStatistics = use(fetchStatisticsCoxtext)


    return(
        <Fragment key={topic.topic_title}>  
            {index > 0 && <DropdownMenuSeparator className='my-2' />}
            <div className="flex items-center justify-between text-sm">
                <span className={(topic.is_completed ? "text-green-600" : "text-muted-foreground") + ' w-full pr-2 overflow-ellipsis'}>
                    {topic.topic_title}
                </span>
                <div className="flex items-center gap-2">
                    {topic.attempt_count > 0 &&
                        <Badge>
                            {topic.attempt_count} попыток
                        </Badge>
                    }
                    <Badge variant='outline' className='max-sm:hidden'>
                        мин. {Math.round(topic.score_for_pass * 100)}%
                    </Badge>
                    {topic.progress > 0 && (
                        <Badge
                            variant="outline" 
                            className={clsx(
                                "text-primary-foreground bg-red-300",
                                topic.progress >= topic.score_for_pass * 0.625 && 'bg-orange-300',
                                topic.progress >= topic.score_for_pass && 'bg-green-300'
                            )}>
                            {Math.round(topic.progress * 100)}%
                        </Badge>
                    )}
                    <span className="text-muted-foreground">
                        {Math.round(topic.progress * topic.question_count)}/{topic.question_count}
                    </span>
                </div>
            </div>
            {topic.unsubmited_answers.length > 0 && (
                <div className="flex justify-end mt-2">
                    <SubmitTextQuestionsDialog 
                        answers={topic.unsubmited_answers}
                        onSuccess={async () => {
                            fetchStatistics()
                        }}
                    />
                </div>
            )}
        </Fragment>
    )
}