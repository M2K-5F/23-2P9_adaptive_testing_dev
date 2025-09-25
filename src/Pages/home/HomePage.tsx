import { CreatedCourse } from "@/Components/models/CreatedCourse";
import { useUserStore } from "@/stores/useUserStore";
import { CreateCourseDialog } from "@/Components/dialogs/create-course-dialog"
import { useCourseStore } from "@/stores/useCourseStore";
import { FollowedCourse } from "@/Components/models/FollowedCourse";
import clsx from "clsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components";

export default function HomePage() {
    const roles = useUserStore(s => s.roles)


    return (
        <div className="p-4 h-full">
            <Accordion defaultValue={['followed', 'created']} type='multiple' >
                {roles.includes('teacher') && <CreatedCoursesSection />}
                {roles.includes('student') && <FollowedCourseSection />}
            </Accordion>
        </div>
    )
}


export function CreatedCoursesSection() {
    const createdCourses = useCourseStore(s => s.createdCourses)

    return(
        <AccordionItem value="created">
            <AccordionTrigger className="mb-8">
                <h1 className="text-2xl font-bold">Курсы созданные мной</h1>
            </AccordionTrigger>
            <AccordionContent>
                {createdCourses.length
                    ?   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {createdCourses.map(course =>
                                <CreatedCourse
                                    key={course.id}
                                    course={course}
                                />
                            )}
                            <CreateCourseDialog
                                className={clsx(
                                    'h-53 flex items-center text-md font-bold',
                                    'justify-center border-2 border-dashed border-gray-300',
                                    'rounded-lg hover:border-gray-400 transition-colors'
                                )}
                                text="+ Создать курс" 
                                variant='outline'
                            />
                        </div>
                    :   <div className="flex flex-col items-center justify-center py-12  rounded-lg shadow-sm">
                            <p className=" mb-4">Нет созданных курсов</p>
                            <CreateCourseDialog
                                text="Создать первый курс"
                                variant='default'
                            />
                        </div>
                }
            </AccordionContent>
        </AccordionItem>
    )
}

export function FollowedCourseSection() {
    const followedGroups = useCourseStore(s => s.followedCoures)

    return(
        <AccordionItem value="followed">
            <AccordionTrigger className="mb-8">
                <h1 className="text-2xl font-bold">Мои курсы</h1>
            </AccordionTrigger>

            {followedGroups.length > 0
                ?   <AccordionContent className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                        {followedGroups.map(userGroup =>
                            <FollowedCourse
                                key={userGroup.course.id}
                                userGroup={userGroup}
                            />
                        )}
                    </AccordionContent>
                :   <AccordionContent className="flex items-center justify-center py-12 rounded-lg shadow-sm">
                        <div className="whitespace-break-spaces text-center py-4 text-lg text-gray-500">
                            Вы не подписаны ни на один курс.
                        </div>
                    </AccordionContent>
            }
        </AccordionItem>
    )
}