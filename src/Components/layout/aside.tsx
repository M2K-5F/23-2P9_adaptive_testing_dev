import React, { FC, memo, useContext, useEffect, useLayoutEffect, useState } from "react";
import { userStore } from "@/stores/userStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useCourseStore } from "@/stores/useCourseStore";
import { Button } from "../ui/button";
import { useTopicStore } from "@/stores/useTopicStore";
import { Link, SetURLSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/Components/ui/skeleton";
import { Label } from "@/Components/ui/label";
import { CreatedCourse } from "@/types/interfaces";
import { SearchContainer } from "@/Components/other/SearchContainer";
import { ApiService, searchCourses } from "@/services/api.service";
import { routes } from "@/config/routes.config";
import { OpenCloseSvg } from "@/Components/ui/aside-close";
import { useAsideVisibilityStore } from "@/Layouts/AppLayout";
import { CreateTopicDialog } from "@/Components/dialogs/create-topic-dialog";
import clsx from "clsx";
import { UserMenu } from "../other/user-menu";
import { CreateCourseDialog } from "@/Components/dialogs/create-course-dialog";


export const AsidePanelLayout: React.FC<{}> = memo(() => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const {isOpen, isDetailVisible, isSummaryVisible} = useAsideVisibilityStore()

    useLayoutEffect(() => {(fetchCourses())}, [])

    useEffect(() => {
            const handle = (e: KeyboardEvent) => {
                if (e.key === '/') {
                    const {isOpen, setIsOpen} = useAsideVisibilityStore.getState()
                    !isOpen && setIsOpen(true)
                }
            }
    
            document.addEventListener('keypress', handle)
            return () => document.removeEventListener('keypress', handle)
        }, [])


    return(
        <aside 
        className={clsx(
            'max-lg:absolute will-change-[width]',
            'h-dvh shrink-0 z-10',
            isOpen ? 'w-[300px]' : 'w-[60px]'
        )}
        style={{transition: `width cubic-bezier(.4,0,.2,1) ${isOpen ?  '.2s' : '.3s'}`}}
        >
            <div 
            className={clsx(
                'h-full bg-[var(--aside)] border-r-2 p-2 py-4',
                'relative flex flex-row-reverse will-change-[width]',
                'overflow-y-scroll',
                isOpen ? 'w-[300px]' : 'w-[60px]'
            )}
            style={{transition: `width cubic-bezier(.4,0,.2,1) ${!isOpen ?  '.2s' : '.3s'}`}}
            >
                <section 
                    className={clsx(
                        'absolute w-[284px] px-2',
                        !isOpen ? 'opacity-0': 'opacity-100'
                    )} 
                    style={{transition: 'opacity .25s cubic-bezier(.97,-0.01,.4,1.02)'}}
                >   
                    {isDetailVisible && 
                        <AsideDetail />
                    }
                </section>
            
                <section className={clsx(
                    'absolute w-[60px] flex',
                    'items-center flex-col h-fit left-0',
                    isOpen ? 'opacity-0': 'opacity-100'
                )} 
                style={{transition: 'opacity .25s cubic-bezier(.97,-0.01,.4,1.02)'}}
                >
                    {isSummaryVisible && 
                        <AsideSummary />
                    }
                </section>
            </div>
        </aside> 
    )
})


const AsideSummary = () => {
    const setIsOpen = useAsideVisibilityStore(s => s.setIsOpen)
    return(
        <>
            <OpenCloseSvg className="" onClick={() => {setIsOpen(true)}} />
        </>
    )
}

const AsideDetail = () => {
    const setIsOpen = useAsideVisibilityStore(s => s.setIsOpen)
    const role = userStore(s => s.role)
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

            {role.includes('teacher') && <AsideTeacherCourses /> }
            {role.includes('student') && <AsideStudentCourses /> }
            
            
        </>
    )
}


const AsideTeacherCourses = () => {
    const [params, setSearch] = useSearchParams()
    const courseId = params.get('course_id')
    const expanded = Number(params.get('expanded'))
    const createdCourses = useCourseStore(s => s.createdCourses)


    return(
        <div className="w-full space-y-3" >
            <span 
                className={clsx('text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 mb-2 mt-6 block')} 
            >Созданные курсы:
            </span>

            {createdCourses.length
                ?   <Accordion className="space-y-2" value={courseId ?? ''} type='single'>
                        {createdCourses.map((course, index) => 
                            <AccordionCourseItem setParams={setSearch} expanded={expanded} course={course} key={index} />
                        )}
                    </Accordion>
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
                            <span className="ml-1 text-xs">
                                Создан: {course.course.created_by}
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