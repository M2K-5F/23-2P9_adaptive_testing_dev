import { useHomeStore } from "../stores/homeStore"
import { FollowedCourseElement } from "./FollowedCourseElement"

export function FollowedCourseSection() {
    const {followedCourses} = useHomeStore()
    return(
        <>
            <header className="portal-header">
                <h1>Мои курсы</h1>
            </header>
            
            {followedCourses.length > 0
                ?   <div className="courses-flex">
                        {followedCourses.map(userCourse =>
                                <FollowedCourseElement
                                key={userCourse.course.id}
                                course={userCourse.course}
                                courseProgress={userCourse.course_progress}
                                />
                            )
                        }
                    </div>
                :   <p className="no-courses-message">Нет доступных курсов для прохождения</p>
            }
        </>
    )
}