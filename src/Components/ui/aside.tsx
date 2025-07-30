import { FC, memo, useLayoutEffect } from "react";
import { userStore } from "@/stores/userStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { useCourseStore } from "@/stores/useCourseStore";
import { Button } from "./button";
import { ThemeSwitcher } from "../ThemeSwither";
import { useTopicStore } from "@/stores/useTopicStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "./skeleton";
import { Label } from "./label";
import { CreatedCourse } from "@/types/interfaces";


export const AsidePanelLayout: FC = memo(() => {
    const role = userStore(s => s.role)
    const fetchCourses = useCourseStore(s => s.fetchCourses)

    useLayoutEffect(() => {(fetchCourses())}, [])

    return(
        <aside className="w-1/6 h-dvh bg-[var(--aside)] border-r-2 p-2">
            {role.includes('teacher') && <AsideTeacherCourses /> }
            {role.includes('student') && <AsideStudentCourses /> }
            <ThemeSwitcher /> 
        </aside> 
    )
})

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

const AccordionCourseItem = ({course}: {course: CreatedCourse}) => {
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

            <AccordionContent className="m-1  bg-[var(--aside)] rounded-md p-2 h-fit">
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
                    : <div className="h-fit w-full grid grid-cols-3 gap-2">{[0,0,0].map(() => <Skeleton className="w- h-9" />)}</div> 
                    }
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

const AsideStudentCourses: FC = () => {
    const navigate = useNavigate()
    const followedCourses = useCourseStore(s => s.followedCoures)
    const setSearch = useSearchParams()[1]

    return(
        <div className="w-full" >
            <Label className="mb-2 mt-4 border-b-2 justify-center w-fit ml-7 text-[16px]" >Прохожу сейчас:</Label>
            <div className="gap-2 flex flex-col w-3/5 m-auto">
                {followedCourses.map((course, index) => 
                    <Button 
                        onClick={() => 
                            window.location.pathname !== '/course'
                                ?   navigate(`/course?fcourse_id=${course.course.id}`)
                                :   setSearch(s => {s.set('fcourse_id', `${course.course.id}`);return s})
                        } 
                        className="block h-fit" 
                        variant={'outline'}
                    > 
                        <Label className="border-b-2 w-fit">{course.course.title}</Label>
                        <span className="text-xs">Создан: {course.course.created_by}</span> 
                    </Button>
                )}
            </div>
        </div>
    )
}