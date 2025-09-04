import { useAsideVisibilityStore } from "@/Layouts/AppLayout"
import { useUserStore } from "@/stores/useUserStore"
import { Link, SetURLSearchParams, useNavigate, useSearchParams } from "react-router-dom"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, CreateCourseDialog, CreateTopicDialog, Label, OpenCloseSvg, SearchContainer, Skeleton } from ".."
import { UserMenu } from "../other/user-menu"
import { searchCourses } from "@/services/api.service"
import clsx from "clsx"
import { routes } from "@/config/routes.config"
import { useCourseStore } from "@/stores/useCourseStore"
import { CreatedCourse } from "@/types/interfaces"
import { FC, memo } from "react"
import { useTopicStore } from "@/stores/useTopicStore"
import { BarChart3 } from "lucide-react"

export const AsideDetail = () => {
    const setIsOpen = useAsideVisibilityStore(s => s.setIsOpen)
    const roles = useUserStore(s => s.roles)
    const navigate = useNavigate()

    
    return(
        <>
            <div className="flex justify-between items-center">
                <Link 
                    to="/" 
                    className="text-sm font-medium text-primary hover:underline flex items-center"
                >
                    ← На главную
                </Link>
                <OpenCloseSvg 
                    className=" rounded hover:bg-gray-100 dark:hover:bg-gray-700 rotate-180 cursor-pointer" 
                    onClick={() => setIsOpen(false)} 
                />
            </div>
            <div className={clsx('flex flex-row my-4 gap-4 border-y py-2')} >
                <UserMenu />
            </div>
            <SearchContainer
                className="my-4"
                searchfn={(query, callbackfn) => {
                    searchCourses(query)
                    .then(data => callbackfn(data))
                }}
                callbackfn={(course) => {navigate(routes.viewCourse(course.id))}}
            />

            {roles.includes('teacher') && <AsideTeacherCourses /> }
            {roles.includes('student') && <AsideStudentCourses /> }
            
            
        </>
    )
}


const AsideTeacherCourses = () => {
    const [params, setSearch] = useSearchParams()
    const courseId = params.get('course_id')
    const expanded = Number(params.get('expanded'))
    const createdCourses = useCourseStore(s => s.createdCourses)
    const navigate = useNavigate()


    return(
        <div className="w-full space-y-3" >
            <div className="flex mb-2 mt-6 items-center justify-baseline">
                <span
                    className={clsx('text-sm font-semibold text-gray-700 dark:text-gray-300 px-2  block')}
                >Созданные курсы:
                </span>
                {createdCourses.length > 0 &&
                    <Button 
                        variant={'secondary'} 
                        onClick={() => navigate('/stats/course?stats_course_id=' + createdCourses[0].id)} 
                        className="ml-auto w-fit py-0.5 h-fit"
                    >
                        <BarChart3 /> 
                        Статистика
                    </Button>
                }
            </div>

            {createdCourses.length
                ?   <>
                        <Accordion className="space-y-2" value={courseId ?? ''} type='single'>
                            {createdCourses.map((course, index) => 
                                <AccordionCourseItem setParams={setSearch} expanded={expanded} course={course} key={index} />
                            )}
                        </Accordion>
                    </>
                :   <div className="text-center flex items-center flex-col py-4 text-sm text-gray-500">
                        <p className=" mb-4">Нет созданных курсов</p>
                        <CreateCourseDialog 
                        className={clsx('w-fit')} 
                            text="Создать первый курс" 
                            variant='outline'
                        />
                    </div>
            }
        </div>
    )
}

interface ItemProps {course: CreatedCourse, expanded: number, setParams: SetURLSearchParams}

const AccordionCourseItem: React.FC<ItemProps> = memo((props) => {
    const navigate = useNavigate()

    return(
        <AccordionItem 
            className={clsx(
                'border-1 rounded-lg overflow-hidden border-b-1',
                'border-primary last:border-b-1',
            )}  
            value={String(props.course.id)}
            >
            <AccordionTrigger 
                className={clsx(
                    "px-3 py-2.5 w-full text-left dark:bg-gray-800 rounded-b-none",
                    "flex items-center justify-between transition-colors",
                    "hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
                onClick={() => {
                    const p = Number((new URLSearchParams(window.location.search)).get('course_id'))
                    if (window.location.pathname !== '/edit/course') {
                        navigate(`/edit/course?course_id=${props.course.id}&expanded=0`)
                    } else if (p === props.course.id) {
                        navigate('/')
                    } else {
                        props.setParams(p => {
                            
                            p.set('course_id', `${props.course.id}`)
                            return p
                        })
                    }
                }}
            >{props.course.title}
            </AccordionTrigger>
            <AccordionCourseContent {...props} />
            
        </AccordionItem>
    )
})

const AccordionCourseContent: FC<ItemProps> = ({setParams, course, expanded}) => {
    const topics = useTopicStore(s => s.createdTopics[course.id])

    return(
        <AccordionContent 
            className={clsx(
                "px-3 py-2 bg-gray-50 dark:bg-muted/50",
                "animate-accordion border-t border-gray-200", 
                "dark:border-gray-700"
            )}
        >
            <div className={clsx("flex items-center justify-between mb-1")}>
                <span className="text-xs text-gray-500 dark:text-gray-400">Темы курса:</span>
                <CreateTopicDialog variant='link' className="col-start-5 col-end-8" text="+ создать" />
            </div>

            <div className="flex mb-1 flex-wrap gap-2">
                {topics
                ?   topics.length
                    ?   topics.map((topic, index) => 
                                <Button key={index}
                                    className={clsx(
                                        'min-w-[calc(50%-5px)] whitespace-normal',
                                        'max-w-full py-5 overflow-hidden justify-baseline'
                                    )} 
                                    variant={expanded === topic.id ? 'default' : 'outline'}
                                    onClick={() => {
                                        if (window.location.pathname === '/edit/course') {
                                            setParams(params => {
                                                params.set('expanded', `${topic.id === expanded ? '0' : topic.id}`)
                                                return params
                                            })
                                        }
                                    }}
                                    >{topic.title}</Button>
                        )
                    :   <Label className="h-9 w-full text-center justify-center">Нет созданных тем</Label>
                :   <div 
                        className="h-fit w-full grid grid-cols-3 gap-2"
                    >{Array.from({length: 3}).map((_, index) => 
                            <Skeleton key={index} className="w- h-9" />)
                    }
                    </div> 
                }
            </div>
        </AccordionContent>
    )
}


const AsideStudentCourses: React.FC = () => {
    const navigate = useNavigate();
    const followedCourses = useCourseStore(s => s.followedCoures);
    const [params, setSearch] = useSearchParams();
    const fcourseId = Number(params.get('fcourse_id'));

    return (
        <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 my-4">
                Мои курсы:
            </h3>

            <div className="flex flex-col gap-3">
                {followedCourses.length > 0 ? (
                    followedCourses.map((course) => (
                        <Button
                            key={course.course.id}
                            variant={fcourseId === course.course.id ? 'default' : 'outline'}
                            size="sm"
                            className={clsx(
                                "w-full h-auto flex gap-0 py-2 flex-col items-start",
                                "text-left justify-baseline",

                            )}
                            onClick={() => {
                                if (window.location.pathname !== '/course') {
                                    navigate(routes.viewCourse(course.course.id))
                                } else {
                                    setSearch(s => {
                                        s.set('fcourse_id', `${course.course.id}`)
                                        return s;
                                    });
                                }
                            }}
                        >
                            <span className="font-medium text-sm">{course.course.title}</span>
                            <span className="mt-1 text-xs">
                                Создан: {course.course.created_by.name}
                            </span>
                        </Button>
                    ))
                ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                        <p>Вы не подписаны ни на один курс.</p>
                        <p className="mt-1">
                            Нажмите 
                            <kbd 
                                onClick={() => {
                                    document.dispatchEvent(new CustomEvent('searchactivate'))
                                }}
                                className={clsx(
                                    "kbd kbd-sm h-4.5 w-4.5 mx-1 cursor-pointer",
                                    "border-gray-500 border inline-grid select-none",
                                    "content-end rounded-sm justify-center text-[12px]"
                                )}
                            >/
                            </kbd> 
                            для поиска
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};