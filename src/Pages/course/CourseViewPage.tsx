import { Fragment, use, useEffect, useLayoutEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTopicStore } from "@/stores/useTopicStore"
import { useCourseStore } from "@/stores/useCourseStore"
import { followCourse, getCourse, unfollowCourse } from "@/services/api.service"
import { 
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Badge,
    AccordionContent,
    Accordion,
    AccordionItem,
    AccordionTrigger,
    CardFooter,
    Loader,
    FollowedTopic,
    CardDescription,
    Progress
} from "@/Components"
import { FetchedCourse } from "@/types/interfaces"
import { BarChart2, BookOpen, Check, GitCommitVerticalIcon, List, LogOut, Plus, RotateCcw, Share2, User, X } from "lucide-react"
import clsx from "clsx"
import { toast } from "sonner"


export function FollowedCoursePage() {
    const [searchParams, setParams] = useSearchParams()
    const courseId = Number(searchParams.get('fcourse_id'))
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [course, setCourse] = useState<FetchedCourse>()
    const createdTopics = useTopicStore(s => s.createdTopics)[courseId]
    const {fetchCreatedTopics, fetchFollowedTopics} = useTopicStore()
    const fetchCourses = useCourseStore(s => s.fetchFollowedCourses)
    const allFollowedTopics = useTopicStore(s => s.followedTopics)
    const followedTopics = course?.user_course ? allFollowedTopics[course.user_course.id] : []

    const handleFollowToggle = async () => {
        setIsLoading(true)
        if (course && course.user_course) {
            await unfollowCourse(courseId)
        } else {
            await followCourse(courseId)
        }
        setCourse(await getCourse(courseId))
        setIsLoading(false)
        await fetchCourses()

    }


    useLayoutEffect(() => {
        setIsLoading(true)
        getCourse(courseId)
            .then(d => {
                setCourse(d)
                setIsLoading(false)
            })
        fetchCreatedTopics(courseId)
    }, [courseId])

    useLayoutEffect(() => {
        course && course.user_course && fetchFollowedTopics(course.user_course.id)
    }, [course])

    
    if (isLoading || !course || !createdTopics || !followedTopics) return <Loader variant='success'/>

    return (
        <div className=" p-6 h-full">
            <div className="max-w-3xl mx-auto">
                <Card className="mb-6 border-foreground">
                    <CardHeader className="flex justify-between items-start space-y-0 ">
                        <section className={clsx('w-full flex-col flex gap-2')} >
                            <div className="flex flex-col w-full gap-2 max-w-full">
                                    
                                    <CardTitle className="max-w-full flex flex-wrap gap-2 items-center mb-1">
                                        <div className="p-2 max-sm:hidden bg-primary/10 rounded-lg ">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        {course.title}fhiudysgipodufsgkuso;
                                    </CardTitle>

                                    <div className={clsx('flex items-baseline justify-between')} >
                                        <div className="flex items-center gap-2 flex-wrap max-w-[250px]">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <List className="h-3 w-3" />
                                                {createdTopics.length || 0} тем.
                                            </Badge>
                                            <Badge className="">
                                                <User className="h-3 w-3 mr-1" />
                                                Автор: {course.created_by}
                                            </Badge>
                                            <Badge
                                                className={clsx(course.user_course ? 'bg-green-400' : 'border-red-500')} 
                                                variant={course.user_course ? "default" : "outline"}
                                            >{course.user_course
                                                    ?   <>
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Подписан
                                                        </>
                                                    :   <>
                                                            <X className="h-3 text-red-400 w-3 mr-1" />
                                                            Не подписан
                                                        </>
                                                }
                                            </Badge>
                                        </div>

                                        <div className={clsx('w-fit flex flex-col max-md:hidden gap-2')}>
                                            <Button
                                                variant="outline"
                                                onClick={async () => {
                                                    await navigator.clipboard.writeText(
                                                    `${window.location.origin}/course?fcourse_id=${course.id}`
                                                    );
                                                    toast.success('Ссылка скопирована в буфер обмена');
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span className="max-md:hidden">Поделиться курсом</span>
                                            </Button>

                                            {course.user_course && 
                                                <Button
                                                    variant="outline"
                                                    onClick={() => alert('TODO functional')}
                                                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                    <span className="max-md:hidden">Сбросить прогресс</span>
                                                </Button>
                                            }
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-md:hidden">
                                        <Badge
                                            variant='secondary'
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(
                                                `${window.location.origin}/course?fcourse_id=${course.id}`
                                                );
                                                toast.success('Ссылка скопирована в буфер обмена');
                                            }}
                                            className="flex items-center gap-2 border border-foreground cursor-pointer"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            <span className="min-md:hidden">Поделиться курсом</span>
                                        </Badge>
                                        {course.user_course && 
                                            <Badge
                                                variant="secondary"
                                                onClick={() => alert('TODO functional')}
                                                className="flex items-center gap-2 text-destructive hover:text-destructive"
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                <span className="min-md:hidden">Сбросить прогресс</span>
                                            </Badge>
                                        }
                                    </div>
                            </div>
                            
                            <Button
                                variant={course.user_course ? "destructive" : "default"}
                                size="sm"
                                onClick={handleFollowToggle}
                                className="flex items-center gap-1 max-w-80 w-full"
                            >{course.user_course
                                ?   <>
                                        <LogOut className="h-4 w-4" />
                                        Отписаться
                                    </>
                                :   <>
                                        <Plus className="h-4 w-4" />
                                        Подписаться
                                    </>
                            }
                            </Button>
                        </section>
                    </CardHeader>

                    {course.user_course && 
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Progress value={course.user_course.course_progress || 0} className="h-2 flex-1" />
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <BarChart2 className="h-4 w-4" />
                                    {Math.round(course.user_course.course_progress || 0)}% завершено
                                </div>
                            </div>
                        </CardContent>
                    }
                    </Card>

                <Accordion defaultValue="topics" type="single" collapsible className="w-full">
                    <AccordionItem value="topics">
                        <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-semibold">Темы курса</h2>
                                <Badge 
                                    variant="outline" 
                                    className="px-2 py-0.5"
                                >{createdTopics.length}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 mt-2">
                                {createdTopics.map((topic, index) => {
                                    const userTopic = (followedTopics.find(ft => ft.topic.id === topic.id))
                                    return (
                                        <Fragment key={topic.id}>
                                            {index > 0 && 
                                                <div className={clsx('p-0 m-0 ml-3.5 flex justify-center items-center w-fit h-7.5 overflow-hidden ')} >
                                                    <GitCommitVerticalIcon size={40} className="" />
                                                </div>
                                            }
                                            <FollowedTopic topic={topic} index={index} userTopic={userTopic} isCourseFollowed={Boolean(course.user_course)} /> 
                                        </Fragment>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}