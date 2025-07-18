import { useHomeStore } from "../stores/homeStore"
import { CreatedCourseElement } from "./CreatedCourseElement"

export function CreatedCoursesSection() {
    const {createCourse, createStatus, toggleMenu, createdCourses} = useHomeStore()
    return(
        <>
            <header className="portal-header">
                <h1>Курсы созданные мной</h1>
                <div style={{position: 'relative'}}>
                    {
                        createStatus.isOpen &&
                        <>
                            <input 
                            id="course-title-input" 
                            style={{
                                color:"black", 
                                marginRight: '5px', 
                                backgroundColor: 'white', 
                                caretColor: "black"
                            }}
                            placeholder="Название курса" 
                            className="create-course-btn"
                            />

                            <button 
                            className="create-course-btn" 
                            onClick={createCourse}
                            style={{marginRight: '5px'}}>
                                ✔
                            </button>
                        </>
                    }
                    <button 
                    className="create-course-btn"
                    style={ createStatus.isOpen ? {backgroundColor: "red"} : {}}
                    onClick={toggleMenu}>{
                        createStatus.isOpen ? "- отменить создание" : "+ Создать новый курс"
                    }</button>
                </div>
            </header>


            {createdCourses.length 
                ? <div className="courses-flex">
                    {
                        createdCourses.map(course => 
                            <CreatedCourseElement 
                            key={course.id}
                            course={course} 
                            />
                        )
                    }
                    </div> 
                : <p className="no-courses-message">Нет созданных курсов</p>
            }
        </>
    )
}