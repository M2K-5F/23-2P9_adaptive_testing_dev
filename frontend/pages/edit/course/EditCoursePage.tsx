import { useNavigate, useSearchParams } from "react-router-dom";
import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { useTopicStore } from "@/stores/useTopicStore";
import { useCourseStore } from "@/stores/useCourseStore";
import clsx from "clsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, CreatedTopic, CreateTopicDialog, Loader } from "@/components";
import { BarChart2, BarChart3, UserRoundPlus, UsersRound } from "lucide-react";
import { ViewGroupDialog } from "@/components/dialogs/view-course-groups-dialog";

export function TopicsPortal() {
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const createdCourses = useCourseStore(s => s.createdCourses)
    const {createdTopics, fetchCreatedTopics} = useTopicStore()
    
    useLayoutEffect(() => {
        if (!courseId) {
            navigate('/')
            return 
        }
        fetchCreatedTopics(courseId)
    }, [courseId])


    return (
        <div
            className={clsx('p-4')}
        >
            <header className={clsx(
                'w-full h-full grid justify-center mb-1  grid-rows-2'
            )}>

                <div 
                    onClick={() => setParams(p => {
                        p.set('expanded', '0')
                        return p
                    })}
                    className={clsx(
                        'text-lg  px-10 text-center cursor-pointer',
                        'border border-background rounded-md col-start-2',
                        'hover:border-border h-fit hover:bg-gray-700'
                    )}
                >{createdCourses.find(c => c.id === courseId)?.title}
                </div>
            </header>

            <Accordion className="border-b border-t mb-4" type='multiple' defaultValue={['actions']}>
                <AccordionItem value="actions">
                    <AccordionTrigger>
                        <h2>Действия с курсом:</h2>
                    </AccordionTrigger>
                    <AccordionContent className="flex gap-2">
                        <ViewGroupDialog courseId={courseId} />
                        <Button 
                            onClick={() => {
                                navigate('/stats/course?stats_course_id=' + createdCourses.find(c => c.id === courseId)?.id)
                            }}
                            className="" 
                        >
                            <BarChart3></BarChart3>
                            Статистика
                        </Button>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {createdTopics[courseId] 
                ?   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {createdTopics[Number(courseId)].map((topic, index) => 
                                <CreatedTopic
                                    key={topic.id}
                                    topic={topic}
                                    index={index}
                                />
                            )}
                            <CreateTopicDialog 
                                className={clsx(
                                    'h-45.5 flex items-center text-md',
                                    'justify-center border-2 border-dashed border-gray-300',
                                    'rounded-lg hover:border-gray-400'
                                )}  
                                text="+ Создать тему" 
                                variant='outline' 
                            />
                        </div>
                :   <Loader className="h-full" variant='success' /> 
            }
        </div>
    )
}