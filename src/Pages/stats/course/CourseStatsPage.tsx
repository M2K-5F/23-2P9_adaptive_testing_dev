import React, { useState, useEffect, FC, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Select, Badge, Progress, Skeleton, SelectItem, SelectContent, SelectTrigger, SelectValue, Loader, Button, DropdownMenuSeparator } from '@/Components';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { useCourseStore } from '@/stores/useCourseStore';
import { s } from 'node_modules/shadcn/dist/index-8c784f6a';
import { useClipboard } from '@/hooks/useClipboard';
import { CourseStats } from '@/types/interfaces';
import { getCourseStats } from '@/services/api.service';
import { Separator } from '@radix-ui/react-select';
import { SubmitTextQuestionsDialog } from '@/Components/dialogs/submit-question-dilog';


export const CourseStatisticsPage: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const course_id = Number(searchParams.get('stats_course_id'))
    const [statistics, setStatistics] = useState<CourseStats | null>(null)
    const [loading, setLoading] = useState(false)
    const createdCourses = useCourseStore(s => s.createdCourses)
    const [error, setError] = useState<string | null>(null)
    const copy = useClipboard()

    useEffect(() => {
        (async () => {
            setLoading(true)
            setError(null)
            try {   
                course_id && setStatistics(await getCourseStats(course_id))
            } catch {
                setError('Ошибка загрузки статистики')
            } finally {
                setLoading(false)
            }
        })()
    }, [course_id])

    if (loading) return <Loader variant='success' />

    return (
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
                        <div className="text-2xl font-bold">{statistics.total_students}</div>
                        <div className="text-muted-foreground">Всего студентов</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{statistics.average_progress ?? 0}%</div>
                        <div className="text-muted-foreground">Средний прогресс</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{statistics.students.filter(s => s.course_progress === 100).length}</div>
                        <div className="text-muted-foreground">Студентов закончивших курс</div>
                    </div>
                </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Статистика студентов</CardTitle>
                    <CardDescription>Детальная информация по каждому студенту:</CardDescription>
                </CardHeader>
                <CardContent className='max-sm:p-2'>
                    <div className="space-y-4">
                        {statistics.students.map((student) => (
                            <Card key={student.user_id} className="p-4">
                                <div className="flex flex-col justify-baseline items-start mb-4">
                                    <div className='flex justify-between w-full flex-row'>
                                        <h3 className="font-semibold">{student.name}</h3>
                                        <Badge variant={student.course_progress === 100 ? "default" : "secondary"}>
                                            {student.course_progress}%
                                        </Badge>
                                    </div>
                                    <Button 
                                        variant={'link'} 
                                        onClick={() => copy(student.telegram_link)} 
                                        className="p-0 text-sm text-muted-foreground"
                                    >
                                        @{student.telegram_link.split('://')[1]}
                                    </Button>
                                </div>

                                <Progress 
                                    offsetValue={2}
                                    value={student.course_progress}
                                />

                                <div className="mt-3 text-sm text-muted-foreground">
                                    {student.completed_topics} из {student.total_topics} тем завершено
                                </div>

                                <div className="mt-4 space-y-2">
                                {student.topics_details.map((topic, index) => (
                                    <Fragment key={topic.topic_id}>  
                                        {index > 0 && <DropdownMenuSeparator className='my-2' />}
                                        <div key={topic.topic_id} className="flex items-center justify-between text-sm">
                                            <span className={(topic.is_completed ? "text-green-600" : "text-muted-foreground") + ' w-full pr-2 overflow-ellipsis'}>
                                                {topic.topic_title}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {topic.average_score > 0 &&
                                                    <Badge 
                                                        variant="outline" 
                                                        className={clsx(
                                                            "text-primary-foreground bg-red-300",
                                                            topic.average_score >= 50 && 'bg-orange-300',
                                                            topic.average_score >= 80 && 'bg-green-300'
                                                                    
                                                        )}>
                                                        {topic.average_score}%
                                                    </Badge>
                                                }

                                                <span className="text-muted-foreground">
                                                    {(topic.topic_progress * topic.question_count).toPrecision(3)}/{topic.question_count}
                                                </span>
                                            </div>
                                        </div>
                                        {topic.unsubmited_answers.length > 0 && (
                                                <div className="flex justify-end mt-2">
                                                    <SubmitTextQuestionsDialog 
                                                        answers={topic.unsubmited_answers}
                                                        onSuccess={async () => {
                                                            setLoading(true)
                                                            setError(null)
                                                            try {   
                                                                course_id && setStatistics(await getCourseStats(course_id))
                                                            } catch {
                                                                setError('Ошибка загрузки статистики')
                                                            } finally {
                                                                setLoading(false)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                    </Fragment>
                                ))}
                                </div>
                            </Card>
                        ))}
                        {!statistics.students.length &&
                            <span className='block text-center mx-auto text-orange-300 w-full'>Еще никто не проходил ваш курс</span>
                        }
                    </div>
                </CardContent>
            </Card>
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
    )
}