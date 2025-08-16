import { useNavigate, useSearchParams } from "react-router-dom";
import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import { useTopicStore } from "@/stores/useTopicStore";
import { useCourseStore } from "@/stores/useCourseStore";
import clsx from "clsx";
import { CreatedTopic, CreateTopicDialog } from "@/Components/ui";

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
        <div className={clsx('p-3')} >
            <header className={clsx(
                'w-full grid grid-cols-3 justify-center justify-items-center mb-4 grid-rows-2'
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
                                'h-42 flex items-center text-md',
                                'justify-center border-2 border-dashed border-gray-300',
                                'rounded-lg hover:border-gray-400'
                            )}  
                            text="+ Создать тему" 
                            variant='outline' 
                        />
                    </div> 
                :   <p className="no-courses-message"> 
                        "Нет созданных тем"
                    </p>
            }
        </div>
    )
}