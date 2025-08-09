import { CreatedCourse } from "@/Components/ui/CreatedCourse";
import { userStore } from "@/stores/userStore";
import { CreateCourseDialog } from "@/Components/ui/create-course-dialog"
import { useCourseStore } from "@/stores/useCourseStore";
import { FollowedCourse } from "@/Components/ui/FollowedCourse";
import clsx from "clsx";


export default function HomePage() {
    const role = userStore(s => s.role)


    return (
        <div className="teacher-portal">
            {role.includes('teacher') && <CreatedCoursesSection /> }

            {role.includes('student') && <FollowedCourseSection /> }
        </div>
    )
}


export function CreatedCoursesSection() {
    const createdCourses = useCourseStore(s => s.createdCourses)

    
    return(
        <>
            <header className="portal-header">
                <h1>Курсы созданные мной</h1>
                <CreateCourseDialog text="+ Создать курс" variant='outline' />
            </header>

            {createdCourses.length 
                ? <div className="courses-flex">
                    {
                        createdCourses.map(course => 
                            <CreatedCourse
                            key={course.id}
                            course={course} 
                            />
                        )
                    }
                    </div> 
                : <p className={clsx()}>Нет созданных курсов</p>
            }
        </>
    )
}


export function FollowedCourseSection() {
    const followedCourses = useCourseStore(s => s.followedCoures)


    return(
        <>
            <header className="portal-header">
                <h1>Мои курсы</h1>
            </header>

            {followedCourses.length > 0
                ?   <div className="courses-flex">
                        {followedCourses.map(userCourse =>
                                <FollowedCourse
                                key={userCourse.course.id}
                                course={userCourse.course}
                                courseProgress={userCourse.course_progress}
                                />
                            )
                        }
                    </div>
                :   <p className={clsx('')} >Нет доступных курсов для прохождения</p>
            }
        </>
    )
}