import { AsidePanel, AsideSummary } from "@/Components/layout/aside"
import useWindowSize from "@/hooks/useWindowSize";
import React, { createContext, FC, memo, RefObject, useLayoutEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Toaster } from "@/Components/ui/sonner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import clsx from "clsx";
import { SearchContainer } from "@/Components";
import { routes } from "@/config/routes.config";
import { searchCourses } from "@/services/api.service";

interface asideSectionsVisibilityStore {
    timer: number
    isOpen: boolean, 
    isSummaryVisible: boolean, 
    isDetailVisible: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export const useAsideVisibilityStore = create<asideSectionsVisibilityStore>()(immer((set, get) => {
        return {
            timer: 0,
            isOpen: false, 
            isDetailVisible: false, 
            isSummaryVisible: true,
            setIsOpen: (isOpen) => {
                set(d => {
                    clearTimeout(get().timer)
                    d.isOpen = isOpen
                    if (isOpen) {
                        d.isDetailVisible = true
                        d.timer = setTimeout(() => set(d => {d.isSummaryVisible = false}), 500) as unknown as number
                    } else {
                        d.isSummaryVisible = true
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
                    <header className={clsx('w-full fixed bg-[var(--aside)] grid-cols-3 items-center justify-items-center content-center grid h-14')} >
                        <div className="w-full pl-4">
                            <AsideSummary />    
                        </div>
                        <SearchContainer
                            className="max-sm:w-45 max-md:w-75 max-lg:w-100 w-120"
                            searchfn={(query, callbackfn) => {
                                searchCourses(query)
                                .then(data => callbackfn(data))
                            }}
                            callbackfn={(course) => {navigate(routes.viewCourse(course.id))}}
                        />
                    </header>
                    <div className="max-h-dvh scrollbar-hidden overflow-y-scroll pt-14">    
                        <Outlet />
                    </div>
                </main>
            </div>
        </React.Fragment>
    )
})