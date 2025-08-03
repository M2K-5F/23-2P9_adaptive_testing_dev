import { FC, memo, useContext, useLayoutEffect, useState } from "react";
import { userStore } from "@/stores/userStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { useCourseStore } from "@/stores/useCourseStore";
import { Button } from "./button";
import { ThemeSwitcher } from "./ThemeSwither";
import { useTopicStore } from "@/stores/useTopicStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "./skeleton";
import { Label } from "./label";
import { CreatedCourse } from "@/types/interfaces";
import { SearchContainer } from "./SearchContainer";
import { searchCourses } from "@/services/api.service";
import { routes } from "@/config/routes.config";
import { OpenCloseSvg } from "./aside-close";
import { useAsideVisibilityStore } from "@/Layouts/AppLayout";


export const AsidePanelLayout: React.FC<{}> = memo(() => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const {isOpen, isDetailVisible, isSummaryVisible} = useAsideVisibilityStore()

    useLayoutEffect(() => {(fetchCourses())}, [])


    return(
        <aside 
        className={`
            h-dvh shrink-0
            max-lg:absolute 
            ${ isOpen ? 'w-[300px]' : 'w-[60px]'}`
        }
        style={{transition: 'width cubic-bezier(.4,0,.2,1) 0.2s'}}
        >
            <div 
            className={`h-full bg-[var(--aside)] border-r-2 p-2 py-4
                relative flex flex-row-reverse
                ${ isOpen ? 'w-[300px]' : 'w-[60px]'}
            `}
            style={{transition: 'width cubic-bezier(.4,0,.2,1) 0.3s'}}
            >
                <section 
                    className={`
                        absolute w-[284px]
                        ${!isOpen ? 'opacity-0': 'opacity-100'}
                    `} 
                    style={{transition: 'opacity .3s linear'}}
                >   
                    {isDetailVisible && 
                        <AsideDetail />
                    }
                </section>
            
                <section className={`
                    absolute w-[60px] flex 
                    items-center flex-col h-fit left-0
                    ${isOpen ? 'opacity-0': 'opacity-100'}
                `} style={{transition: 'opacity .3s linear'}}
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
            <SearchContainer
                className="mb-4"
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
    const createdCourses = useCourseStore(s => s.createdCourses)

    return(
        <div className="w-full" >
            <Label className="mb-2 mt-4 border-b-2 justify-center w-fit ml-7 text-[16px]" >Созданные курсы:</Label>
            <Accordion className="bg-card rounded-md p-3" value={courseId ?? ''} type='single'>
                {createdCourses.map((course, index) => <AccordionCourseItem course={course} key={index} /> )}
            </Accordion>
        </div>
    )
}


const AccordionCourseItem: React.FC<{course: CreatedCourse}> = ({course}) => {
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const expandedTopic = Number(params.get('expanded'))
    const navigate = useNavigate()
    const topics = useTopicStore(s => s.createdTopics[course.id])


    return(
        <AccordionItem className={`p-1 `} value={String(course.id)}>
            <AccordionTrigger 
                onClick={() => {
                    if (window.location.pathname !== '/edit/course') {
                        navigate(`/edit/course?course_id=${course.id}&expanded=0`)
                    } else {
                        setParams({'course_id': `${course.id}`, 'expanded': '0'})
                    }
                }}
            >{
                course.title
            }</AccordionTrigger>

            <AccordionContent className="m-1 border  bg-input rounded-md p-2 h-fit">
                <Label className="m-2 p-2 ml-4 border-b-2 py-1 w-fit">Темы курса:</Label>
                <div className="flex flex-wrap gap-2 justify-center">
                    {topics
                    ?   topics.length
                        ?   topics.map((topic, index) => 
                                    <Button key={index}
                                        variant={expandedTopic === topic.id ? 'default' : 'link'}
                                        onClick={() => {
                                            if (window.location.pathname === '/edit/course') {
                                                params.set('expanded', `${topic.id === expandedTopic ? '0' : topic.id}`)
                                                setParams(params)
                                            }
                                        }}
                                        >{topic.title}</Button>
                            )
                        :   <Label className="h-9">Нет созданных тем</Label>
                    : <div className="h-fit w-full grid grid-cols-3 gap-2">{Array.from({length: 3}).map(() => <Skeleton className="w- h-9" />)}</div> 
                    }
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}


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