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
    FollowedTopic
} from "@/Components/ui"
import { FetchedCourse } from "@/types/interfaces"
import { GitCommitVerticalIcon } from "lucide-react"
import clsx from "clsx"


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
                <Card className="border-foreground">
                    <CardHeader className="flex-row justify-between items-start gap-4">
                        <div>
                            <CardTitle className="text-2xl mb-2">
                                {course.title}
                            </CardTitle>

                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">Автор: {course.created_by}</Badge>
                                
                                <Badge 
                                    variant={course.user_course ? "default" : "outline"}
                                >{course.user_course ? "Подписан" : "Не подписан"}
                                </Badge>
                            </div>
                        </div>

                        <Button 
                            variant={course.user_course ? "destructive" : "default"}
                            size="sm"
                            onClick={handleFollowToggle}
                        >{course.user_course ? "Отписаться" : "Подписаться"}
                        </Button>
                    </CardHeader>
                    
                    {course.user_course && <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${course.user_course.course_progress}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {Math.round(course.user_course.course_progress)}% завершено
                            </span>
                        </div>
                    </CardContent>}
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
                                            <FollowedTopic topic={topic} index={index} userTopic={userTopic} /> 
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