import { ChangeEvent, useLayoutEffect, useState } from "react"
import { SearchElement } from "./SearchElement"
import { useDebounce } from "../hooks/useDebounce"
import { CreatedCourse } from "../types/interfaces"
import { getSearchedCourses } from "../services/api.service"

export const SearchContainer = <T extends CreatedCourse>({placeholder, searchfn, handlefn, summary, title}: {
    placeholder: string
    searchfn: (searchQuery: string, callback: (courses: T[]) => void) => void
    handlefn: (element: T) => void
    title?: keyof T
    summary?: {name: string, content: keyof T}
}) => {
    const [searchedCourses, setSearchedCourses] = useState<T[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')

    const searchCourses = useDebounce((query: string) => {
        searchfn(query, (courses) => setSearchedCourses(courses))
    })


    return(
        <search style={{position: 'sticky'}} className="courses-search-container">
            <div style={{position: 'relative'}}>
                <input
                    max={60}
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={e => {
                        const query = e.currentTarget.value
                        setSearchQuery(query)

                        if (query) {
                            searchCourses(query)
                        } else {
                            setSearchedCourses([])
                            console.log('fsfsfsfsf');
                        }
                    }}
                    className="courses-search-input"
                />
                <span className="search-icon">🔍</span>
            </div>

            {searchQuery.length > 0 && 
                <section className="search-variants-section">
                    {searchedCourses.length 
                        ?   searchedCourses.map( course => 
                                <SearchElement<T> key={course.id} element={course} title={title ? title : 'title'} callbackfn={handlefn} summary={summary ?? undefined} />
                            ) 
                        :   <span>Ничего не найдено</span>
                    }
                </section> 
            }
        </search>
    )
}