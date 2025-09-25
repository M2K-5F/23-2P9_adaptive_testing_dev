import { AsidePanel, AsideSummary } from "@/Components/layout/aside"
import useWindowSize from "@/hooks/useWindowSize";
import React, { createContext, FC, memo, RefObject, useLayoutEffect, useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Toaster } from "@/Components/ui/sonner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import clsx from "clsx";
import { SearchContainer } from "@/Components";
import { routes } from "@/config/routes.config";
import { searchCourses } from "@/services/api.service";
import { House } from "lucide-react";

interface asideSectionsVisibilityStore {
    timer: number
    isOpen: boolean, 
    isDetailVisible: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export const useAsideVisibilityStore = create<asideSectionsVisibilityStore>()(immer((set, get) => {
        return {
            timer: 0,
            isOpen: false, 
            isDetailVisible: false, 
            setIsOpen: (isOpen) => {
                set(d => {
                    clearTimeout(get().timer)
                    d.isOpen = isOpen
                    if (isOpen) {
                        d.isDetailVisible = true
                    } else {
                        d.timer = setTimeout(() => set(d => {d.isDetailVisible = false}), 500) as unknown as number
                    }
                })
            }
        }
}))


export const AppLayout: FC = memo(() => {
    const navigate = useNavigate()
    return(
        <React.Fragment>
            <div className='h-dvh max-h-dvh w-dvw'>
                <AsidePanel />
                <main className="h-full max-h-full">    
                    <header 
                        className={clsx(
                            'w-full fixed bg-[var(--aside)]',
                            'items-center justify-items-start', 
                            'content-center flex h-14 z-20 px-4'
                        )} 
                    >
                        <AsideSummary />
                        <div className="grow" />
                        <SearchContainer
                            className="max-sm:w-45 max-md:w-75 max-lg:w-100 w-120"
                            searchfn={(query, callbackfn) => {
                                searchCourses(query)
                                .then(data => callbackfn(data))
                            }}
                            callbackfn={(course) => {navigate(routes.viewCourse(course.id))}}
                        />
                        <Link 
                            to="/" 
                            className="text-sm mx-4 font-medium text-primary hover:underline flex items-center"
                        >
                            <House />
                        </Link>
                        
                        <div className="grow" />
                    </header>
                    <div className="max-h-dvh h-dvh scrollbar-hidden overflow-y-scroll pt-14">    
                        <Outlet />
                    </div>
                </main>
            </div>
        </React.Fragment>
    )
})