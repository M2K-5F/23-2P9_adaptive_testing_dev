import { AsidePanelLayout } from "@/Components/ui/aside"
import useWindowSize from "@/hooks/useWindowSize";
import React, { createContext, FC, memo, RefObject, useLayoutEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { Toaster } from "@/Components/ui/sonner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface asideSectionsVisibilityStore {
    timer: number
    isOpen: boolean, 
    isSummaryVisible: boolean, 
    isDetailVisible: boolean,
    setIsOpen: (isOpen: boolean) => void
}

export const useAsideVisibilityStore = create<asideSectionsVisibilityStore>()(immer((set, get) => {
        const isOpen = window.innerWidth > 1024
        return {
            timer: 0,
            isOpen: isOpen, 
            isDetailVisible: isOpen, 
            isSummaryVisible: !isOpen,
            setIsOpen: (isOpen) => {
                set(d => {
                    clearTimeout(get().timer)
                    d.isOpen = isOpen
                    if (isOpen) {
                        d.isDetailVisible = true
                        d.timer = setTimeout(() => set(d => {d.isSummaryVisible = false}), 1000)
                    } else {
                        d.isSummaryVisible = true
                        d.timer = setTimeout(() => set(d => {d.isDetailVisible = false}), 1000)
                    }
                })
            }
        }
}))


export const AppLayout: FC = memo(() => {
    useWindowSize()
    const {isOpen, setIsOpen} = useAsideVisibilityStore()

    useLayoutEffect(() => {
        isOpen && window.innerWidth < 1024 && setIsOpen(false)

        !isOpen && window.innerWidth > 1024 && setIsOpen(true)
    }, [window.innerWidth])

    return(
        <React.Fragment>
            <Toaster position='top-center' />
            <div className='flex w-dvw'>
                <AsidePanelLayout /> 
                <main className="p-4 grow overflow-y-scroll max-lg:ml-[60px] h-dvh" style={{willChange: 'width'}}>    
                    <Outlet />
                </main>
            </div>
        </React.Fragment>
    )
})