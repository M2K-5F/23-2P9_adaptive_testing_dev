import { NavigateFunction } from "react-router-dom"
import { CreatedCourse } from "../types/interfaces"

export const SearchElement = ({course, callbackfn}: {
    course: CreatedCourse,
    callbackfn: (...args) => void
}) => {
    return (
        <div 
        key={course.id} 
        onClick={() => {callbackfn(course)}} 
        className="search-list-param">
            <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="currentColor" 
            height="24" 
            viewBox="0 0 24 24" 
            width="24" 
            focusable="false" 
            aria-hidden="true">
                <path clipRule="evenodd" 
                d="M16.296 16.996a8 8 0 11.707-.708l3.909 
                3.91-.707.707-3.909-3.909zM18 11a7 7 0 
                00-14 0 7 7 0 1014 0z" 
                fillRule="evenodd">
                </path>
            </svg>

            <span 
            key={course.id} 
            className="search-variants">
                <span 
                style={{
                    marginRight: '10px',
                    color: "#2196F3",
                    fontSize: '1.1rem'
                    }}>{
                        course.title
                    }</span>

                создан:

                <span 
                style={{
                    marginLeft: '5px',
                    color: "#4CAF50", 
                    fontSize: '1.1rem'
                }}>{
                    course.created_by
                }</span>
            </span>

        </div>
    )
}