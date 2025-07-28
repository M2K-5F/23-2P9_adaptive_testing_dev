import { FC, useLayoutEffect } from "react";
import { userStore } from "@/stores/userStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { useCourseStore } from "@/stores/useCourseStore";
import { Button } from "./button";
import { ThemeSwitcher } from "../ThemeSwither";
import { useTopicStore } from "@/stores/useTopicStore";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./skeleton";
import { useAsideApi } from "@/stores/useAsideStore";


export const AsidePanelLayout: FC = () => {
    const {role} = userStore()
    const fetchCourses = useCourseStore(s => s.fetchCourses)

    useLayoutEffect(() => {(fetchCourses())}, [])

    return(
        <aside className="w-1/4 h-dvh bg-card">
            {role.includes('teacher') && <AsideTeacherCourses /> }
            <ThemeSwitcher /> 
        </aside>
    )
}

const AsideTeacherCourses = () => {
    const navigate = useNavigate()
    const { expandedCreatedCourse, setExpandedCreatedCourse } = useAsideApi()
    const createdCourses = useCourseStore(s => s.createdCourses)
    const createdTopics = useTopicStore(store => store.createdTopics)

    return(
        <div>
            <h4>Темы созданные мной:</h4>
            <Accordion value={String(expandedCreatedCourse)} type='single'>
                {createdCourses.map((createdCourse, index) => {
                    return(
                        <AccordionItem value={String(createdCourse.id)}>
                            <AccordionTrigger 
                                onClick={() => {
                                    if (window.location.pathname !== '/edit/course' || expandedCreatedCourse !== createdCourse.id) {
                                        navigate('/edit/course?course_id=' + createdCourse.id)
                                    }
                                }}
                            >{
                                createdCourse.title
                            }</AccordionTrigger>

                            <AccordionContent className="flex justify-center pl-2 pr-2">
                                {createdTopics[createdCourse.id] && createdTopics[createdCourse.id].length
                                    ?   createdTopics[Number(createdCourse.id)].map((topic, index) => 
                                                <Button 
                                                    variant='link'
                                                    onClick={() => {
                                                        if (window.location.pathname === '/edit/course') {
                                                            null
                                                        } else {
                                                            navigate('/edit/course?course_id=' + createdCourse.id + '&expanded=' + topic.id)
                                                        }
                                                    }}
                                                    >{topic.title}</Button>
                                        )
                                    :   <div className="h-fit w-full grid grid-cols-3 gap-2">{[0,0,0].map(() => <Skeleton className="w- h-6" />)}
                                        </div> 
                                }
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    )
}