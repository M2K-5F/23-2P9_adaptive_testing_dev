import React, { ChangeEvent, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useDebounce } from "../../hooks/useDebounce"
import { CreatedCourse } from "../../types/interfaces"
import { Input } from "./input"
import { Flashlight, Key } from "lucide-react"
import { SelectGroup, SelectItem } from "./select"
import { ScrollArea } from "./scroll-area"
import { Separator } from "@radix-ui/react-select"

interface props<T> {
    className?: string
    placeholder?: string
    searchfn: (searchQuery: string, callback: (courses: T[]) => void) => void
    callbackfn: (element: T) => void
    delay?: number
    maxlengh?: number
}

export const SearchContainer = <T extends CreatedCourse>(props: props<T> ) => {
    const [searchedCourses, setSearchedCourses] = useState<T[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const input = useRef<null | HTMLInputElement>(null)
    
    const searchCourses = useDebounce((query: string) => {
        props.searchfn(query, (courses) => setSearchedCourses(courses))
    }, props.delay)


    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement !== input.current) {
                e.preventDefault()
                input.current?.focus()
            }
        }

        document.addEventListener('keypress', handle)
        return () => document.removeEventListener('keypress', handle)
    }, [])

    useEffect(() => {
        searchQuery 
        ?   searchCourses(searchQuery)
        :   setSearchedCourses([])
    }, [searchQuery])


    return(
        <search className={"h-fit" + ' ' + props.className} >
            <div className="relative w-full h-fit">
                <Input
                    ref={input}
                    placeholder=""
                    className="pl-7 srch-input bg-background"
                    max={props.maxlengh ?? 60}
                    value={searchQuery}
                    onChange={e => {
                        setSearchQuery(e.currentTarget.value)
                    }}
                />
                <div onClick={() => input.current?.focus()} className=" select-none w-fit h-full cursor-text items-center pl-2 flex top-0 gap-1 absolute text-[14px]">
                    <svg aria-hidden="true" className="fill-black dark:fill-white" color="#ffffff" height="16" viewBox="0 0 16 16" width="16" >
                        <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path>
                    </svg>
                    <div className="flex gap-1 items-baseline srch-placeholder ">
                        Нажми
                        <span className="border-foreground border inline-grid content-end rounded-sm justify-center text-[12px] h-4.5 w-4.5">/</span>
                        для поиска
                    </div>
                </div>
            </div>
        
            {searchQuery.length > 0 && 
                <ScrollArea className="p-2 h-fit w-11/12 m-auto mt-2 bg-card dark:bg-input rounded-md border">
                    <h4 className="text-sm font-medium">Найденные курсы:</h4>
                    {searchedCourses.length
                        ?   searchedCourses.map(course => 
                                <>
                                    <Separator  className="my-1 bg-foreground w-full h-px"/>
                                    <div onClick={() => props.callbackfn(course)} className="rounded-sm cursor-pointer w-5/6 pl-3 text-md border border-transparent font-medium ml-2 hover:border-border hover:bg-border">{course.title}</div> 
                                </>
                            )   
                        :   <h4>Ничего не найдено</h4>
                    }
                </ScrollArea>
            }
        </search>
    )
}