import React, { FC, memo, useContext, useEffect, useLayoutEffect, useState } from "react";
import { useCourseStore } from "@/stores/useCourseStore";
import { OpenCloseSvg } from "@/components/ui/aside-close";
import { useAsideVisibilityStore } from "@/layouts/AppLayout";
import clsx from "clsx";
import { AsideDetail } from "./aside-details";


export const AsidePanel: React.FC<{}> = memo(() => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const {isOpen, isDetailVisible, setIsOpen} = useAsideVisibilityStore()

    useLayoutEffect(() => {(fetchCourses())}, [])

    useEffect(() => {
        const eventhandler = (e: Event) => {
            setIsOpen(false)
        }

        document.querySelector('main.h-full.max-h-full')?.addEventListener(
            'click', eventhandler
        )
        return () => {
            document.querySelector('main.h-full.max-h-full')?.removeEventListener('click', eventhandler)
        }
    }, [])


    return(
        <div
            className={clsx(
                'fixed select-none',
                'h-dvh z-30',
            )}
        >
            <aside
            className={clsx(
                'h-full',
                'relative flex flex-row-reverse will-change-[width]',
                '',
                isOpen ? 'w-77' : 'w-0'
            )}
            style={{transition: `width cubic-bezier(.4,0,.2,1) .4s`}}
            >
                <section 
                    className={clsx(
                        'absolute w-77 p-3 py-5 border-r-2 bg-[var(--aside)] h-full rounded-r-2xl',
                        !isOpen ? 'opacity-0': 'opacity-100'
                    )} 
                    style={{transition: 'opacity .4s cubic-bezier(.97,-0.01,.4,1.02)'}}
                >   
                    {isDetailVisible && 
                        <AsideDetail />
                    }
                </section>
            </aside>
        </div> 
    )
})


export const AsideSummary = () => {
    const setIsOpen = useAsideVisibilityStore(s => s.setIsOpen)
    return(
            <OpenCloseSvg className="rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={(e) => {setIsOpen(true), e.stopPropagation()}} />
    )
}

