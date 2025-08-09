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
    const {createdTopics, fetchTopics} = useTopicStore()
    
    useLayoutEffect(() => {
        if (!courseId) {
            navigate('/')
            return 
        }
        fetchTopics(courseId)
    }, [courseId])


    return (
        <Fragment>
            <header className={clsx(
                'w-full grid grid-cols-3 justify-center justify-items-center mb-4 grid-rows-2'
            )}>
                <CreateTopicDialog 
                    text="+ Создать новую тему" 
                    variant='secondary' 
                    className="w-fit mr-auto row-start-2"
                />

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
                ?   <div className="grid grid-flow-row grid-cols-4 gap-x-3 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 items-baseline">
                        {createdTopics[Number(courseId)].map((topic, index) => 
                            <CreatedTopic
                                key={topic.id}
                                topic={topic}
                                index={index}
                            />
                        )}
                    </div> 
                :   <p className="no-courses-message"> 
                        "Нет созданных тем"
                    </p>
            }
        </Fragment>
    )
}