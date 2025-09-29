import { Fragment, use, useEffect, useLayoutEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTopicStore } from "@/stores/useTopicStore"
import { useCourseStore } from "@/stores/useCourseStore"
import { getCourseById } from "@/services/course"
import { 
    Card,CardHeader,
    CardTitle, CardContent,
    Button, Badge,
    AccordionContent, Accordion,
    AccordionItem, AccordionTrigger,
    Loader, FollowedTopic, Progress
} from "@/components"
import { FetchedCourse, FetchedGroup, UserGroup } from "@/types/interfaces"
import { 
    BarChart2, BookOpen, Check, 
    GitCommitVerticalIcon, List, 
    LogOut, Plus, RotateCcw, 
    Share2, User, UserRound, X 
} from "lucide-react"
import clsx from "clsx"
import { toast } from "sonner"
import { useClipboard } from "@/hooks/useClipboard"
import { ClearUCProgressDialog } from "@/components/dialogs/clear_uc_progress_dialog"
import { FollowGroupDialog } from "@/components/dialogs/follow-group-dialog"
import { unfollowGroup } from "@/services/group"



export function FollowedCoursePage() {
    const [searchParams, setParams] = useSearchParams()
    const courseId = Number(searchParams.get('fcourse_id'))
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [course, setCourse] = useState<FetchedCourse>()
    const createdTopics = useTopicStore(s => s.createdTopics)[courseId]
    const {fetchCreatedTopics, fetchFollowedTopics} = useTopicStore()
    const fetchCourses = useCourseStore(s => s.fetchFollowedCourses)
    const allFollowedTopics = useTopicStore(s => s.followedTopics)
    const followedTopics = course?.user_group ? allFollowedTopics[course.user_group.id] : []
    const copyToCB = useClipboard()

    const followHandler = async () => {
        setIsLoading(true)
        setCourse(await getCourseById(courseId))
        setIsLoading(false)
        await fetchCourses()
    }


    useLayoutEffect(() => {
        (async () => {
            setIsLoading(true)
            setCourse(await getCourseById(courseId))
            const _ = await fetchCreatedTopics(courseId)
            setIsLoading(false)
        })()
        
    }, [courseId])

    useLayoutEffect(() => {
        if (course && course.user_group){
            setIsLoading(true)
            fetchFollowedTopics(course.user_group.id)
                .then(() => setIsLoading(false))
        } 
    }, [course])

    
    if (isLoading || !course || !createdTopics || !followedTopics) return <Loader className="" variant='success'/>

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
                                        {course.title}
                                    </CardTitle>

                                    <div className={clsx('flex items-baseline justify-between')} >
                                        <div className="flex items-center gap-2 flex-wrap max-w-[250px]">
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <List className="h-3 w-3" />
                                                {createdTopics.length || 0} тем.
                                            </Badge>
                                            <Badge className="">
                                                <User className="h-3 w-3 mr-1" />
                                                Автор: {course.created_by.username}
                                            </Badge>
                                            <Badge
                                                className={clsx(course.user_group ? 'bg-green-400' : 'border-red-500')} 
                                                variant={course.user_group ? "default" : "outline"}
                                            >{course.user_group
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
                                            {course.user_group &&
                                                <Badge>
                                                    <UserRound />
                                                    Группа: {course.user_group.group.title}
                                                </Badge>
                                            }
                                        </div>

                                        <div className={clsx('w-fit flex flex-col max-md:hidden gap-2')}>
                                            <Button
                                                variant="outline"
                                                onClick={async () => {
                                                    await copyToCB(
                                                    `${window.location.origin}/course?fcourse_id=${course.id}`
                                                    )
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span className="max-md:hidden">Поделиться курсом</span>
                                            </Button>

                                            {course.user_group && 
                                                <ClearUCProgressDialog 
                                                    userCourseId={course.user_group.id} 
                                                    callback={async (id) => {
                                                        await fetchFollowedTopics(id)
                                                        setCourse(await getCourseById(courseId))
                                                    }}
                                                /> 
                                            }
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-md:hidden">
                                        <Badge
                                            variant='secondary'
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(
                                                        `${window.location.origin}/course?fcourse_id=${course.id}`
                                                    )
                                                    toast('Ссылка скопирована в буфер обмена')
                                                } catch {
                                                    toast('Не удалось скопировать')
                                                }
                                            }}
                                            className="flex items-center gap-2 border border-foreground cursor-pointer"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            <span className="min-md:hidden">Поделиться курсом</span>
                                        </Badge>
                                        {course.user_group && 
                                            <ClearUCProgressDialog 
                                                isBadge 
                                                userCourseId={course.user_group.id}
                                                callback={async (id) => {
                                                    await fetchFollowedTopics(id)
                                                    setCourse(await getCourseById(courseId))
                                                }}
                                            />
                                        }
                                    </div>
                            </div>
                            {course.user_group
                                ?   <Button
                                        variant={course.user_group ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => {unfollowGroup((course.user_group as UserGroup).group.id).then(() => {followHandler()})}}
                                        className="flex items-center gap-1 max-w-80 w-full"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Отписаться
                                    </Button>
                                :   <FollowGroupDialog courseId={courseId} user_group={course.user_group}  followCallback={followHandler}/> 
                            }
                        </section>
                    </CardHeader>

                    {course.user_group && 
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Progress offsetValue={2}
                                    value={course.user_group.progress * 100}
                                />
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <BarChart2 className="h-4 w-4" />
                                    {Math.round(course.user_group.progress * 100 || 0)}% завершено
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
                                            <FollowedTopic topic={topic} index={index} userTopic={userTopic} isCourseFollowed={Boolean(course.user_group)} /> 
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