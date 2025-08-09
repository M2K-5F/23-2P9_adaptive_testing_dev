import { FC, memo, useContext, useEffect, useLayoutEffect, useState } from "react";
import { userStore } from "@/stores/userStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { useCourseStore } from "@/stores/useCourseStore";
import { Button } from "./button";
import { ThemeSwitcher } from "./ThemeSwither";
import { useTopicStore } from "@/stores/useTopicStore";
import { Link, SetURLSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "./skeleton";
import { Label } from "./label";
import { CreatedCourse } from "@/types/interfaces";
import { SearchContainer } from "./SearchContainer";
import { ApiService, searchCourses } from "@/services/api.service";
import { routes } from "@/config/routes.config";
import { OpenCloseSvg } from "./aside-close";
import { useAsideVisibilityStore } from "@/Layouts/AppLayout";
import { CreateTopicDialog } from "./create-topic-dialog";
import clsx from "clsx";


export const AsidePanelLayout: React.FC<{}> = memo(() => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const {isOpen, isDetailVisible, isSummaryVisible} = useAsideVisibilityStore()

    useLayoutEffect(() => {(fetchCourses())}, [])


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
                isOpen ? 'w-[300px]' : 'w-[60px]'
            )}
            style={{transition: `width cubic-bezier(.4,0,.2,1) ${!isOpen ?  '.2s' : '.3s'}`}}
            >
                <section 
                    className={clsx(
                        'absolute w-[284px]',
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
            <OpenCloseSvg className="ml-auto rotate-180" onClick={() => {setIsOpen(false)}} />
            <Link to='' className="font-normal border-b w-fit border-white">{'<- на главную'}</Link>
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
            
            <ThemeSwitcher />
        </>
    )
}


const AsideTeacherCourses = () => {
    const [params, setSearch] = useSearchParams()
    const courseId = params.get('course_id')
    const expanded = Number(params.get('expanded'))
    const createdCourses = useCourseStore(s => s.createdCourses)


    return(
        <div className="w-full" >
            <Label 
                className={clsx(
                    "mb-2 mt-4 border-b-2 justify-center", 
                    "w-fit ml-7 text-[16px]"
                )} 
            >Созданные курсы:
            </Label>

            <Accordion className="bg-card rounded-md p-3" value={courseId ?? ''} type='single'>
                {createdCourses.map((course, index) => 
                    <AccordionCourseItem setParams={setSearch} expanded={expanded} course={course} key={index} />
                )}
            </Accordion>
        </div>
    )
}


const AccordionCourseItem: React.FC<{course: CreatedCourse, expanded: number, setParams: SetURLSearchParams}> = memo(({course, expanded, setParams}) => {
    const navigate = useNavigate()
    const topics = useTopicStore(s => s.createdTopics[course.id])
    

    return(
        <AccordionItem 
            className={`p-1 `} 
            value={String(course.id)}
            >
            <AccordionTrigger 
                onClick={() => {
                    if (window.location.pathname !== '/edit/course') {
                        navigate(`/edit/course?course_id=${course.id}&expanded=0`)
                    } else {
                        setParams(p => {
                            p.set('course_id', `${course.id}`)
                            return p
                        })
                    }
                }}
            >{course.title}
            </AccordionTrigger>

            <AccordionContent 
                className="m-1 border bg-muted rounded-md p-2 h-fit"
            >
                <div className={clsx("grid grid-cols-7 w-full  border-b-2 pb-1 mb-2")}>
                    <Label className="col-end-5 col-start-1 p-2 ml-4 py-1 w-fit">Темы курса:</Label>
                    <CreateTopicDialog variant='link' className="col-start-5 col-end-8" text="+ создать" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {topics
                    ?   topics.length
                        ?   topics.map((topic, index) => 
                                    <Button key={index}
                                        className="min-w-[calc(50%-5px)] whitespace-normal max-w-full py-5 overflow-hidden justify-baselin"
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
                        >{Array.from({length: 3}).map(() => 
                                <Skeleton className="w- h-9" />)
                        }
                        </div> 
                    }
                </div>
            </AccordionContent>
        </AccordionItem>
    )
})


const AsideStudentCourses: React.FC<{}> = () => {
    const navigate = useNavigate()
    const followedCourses = useCourseStore(s => s.followedCoures)
    const [params, setSearch] = useSearchParams()
    const fcourseId = Number(params.get('fcourse_id'))           

    return(
        <div className="mb-4 w-full" >
            <Label className="mb-2 mt-4 border-b-2 justify-center w-fit ml-7 text-[16px]" >Прохожу сейчас:</Label>
            <div className="gap-2 flex flex-col w-full bg-card rounded-md p-3">
                {followedCourses.map((course, index) => 
                    <Button 
                        key={index}
                        onClick={() => 
                            window.location.pathname !== '/course'
                                ?   navigate(`/course?fcourse_id=${course.course.id}`)
                                :   setSearch(s => {s.set('fcourse_id', `${course.course.id}`);return s})
                        } 
                        className="block w-fit h-fit" 
                        variant={ fcourseId === course.course.id ? 'default' : 'outline'}
                    > 
                        <Label className="border-b-2 w-fit">{course.course.title}</Label>
                        <span className="text-xs">Создан: {course.course.created_by}</span> 
                    </Button>
                )}
            </div>
        </div>
    )
}