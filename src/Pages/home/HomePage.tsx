import { CreatedCourse } from "@/Components/ui/CreatedCourse";
import { userStore } from "@/stores/userStore";
import { CreateCourseDialog } from "@/Components/ui/create-course-dialog"
import { useCourseStore } from "@/stores/useCourseStore";
import { FollowedCourse } from "@/Components/ui/FollowedCourse";
import clsx from "clsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/Components/ui";

export default function HomePage() {
    const role = userStore(s => s.role)

    return (
        <div className="p-8 min-h-screen">
            <Accordion defaultValue={['followed', 'created']} type='multiple' >
                {role.includes('teacher') && <CreatedCoursesSection />}
                {role.includes('student') && <FollowedCourseSection />}
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
                    ?   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {createdCourses.map(course =>
                                <CreatedCourse
                                    key={course.id}
                                    course={course}
                                />
                            )}
                            <CreateCourseDialog
                                className={clsx(
                                    'h-full flex items-center text-md',
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
    const followedCourses = useCourseStore(s => s.followedCoures)

    return(
        <AccordionItem value="followed">
            <AccordionTrigger className="mb-8">
                <h1 className="text-2xl font-bold">Мои курсы</h1>
            </AccordionTrigger>

            {followedCourses.length > 0
                ?   <AccordionContent className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                        {followedCourses.map(userCourse =>
                            <FollowedCourse
                                key={userCourse.course.id}
                                userCourse={userCourse}
                            />
                        )}
                    </AccordionContent>
                :   <AccordionContent className="flex items-center justify-center py-12 rounded-lg shadow-sm">
                        <div className="scale-120 text-center py-4 text-sm text-gray-500">
                            <p>Вы не подписаны ни на один курс.</p>
                            <p className="mt-1">
                                Нажмите 
                                <kbd className={clsx(
                                    "kbd kbd-sm h-4.5 w-4.5 mx-1",
                                    "border-gray-500 border inline-grid",
                                    "content-end rounded-sm justify-center text-[12px]"
                                )}>/</kbd> 
                                для поиска
                            </p>
                        </div>
                    </AccordionContent>
            }
        </AccordionItem>
    )
}