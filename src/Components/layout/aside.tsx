import React, { FC, memo, useContext, useEffect, useLayoutEffect, useState } from "react";
import { userStore } from "@/stores/userStore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useCourseStore } from "@/stores/useCourseStore";
import { Button } from "../ui/button";
import { useTopicStore } from "@/stores/useTopicStore";
import { Link, SetURLSearchParams, useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/Components/ui/skeleton";
import { Label } from "@/Components/ui/label";
import { CreatedCourse } from "@/types/interfaces";
import { SearchContainer } from "@/Components/other/SearchContainer";
import { ApiService, searchCourses } from "@/services/api.service";
import { routes } from "@/config/routes.config";
import { OpenCloseSvg } from "@/Components/ui/aside-close";
import { useAsideVisibilityStore } from "@/Layouts/AppLayout";
import { CreateTopicDialog } from "@/Components/dialogs/create-topic-dialog";
import clsx from "clsx";
import { UserMenu } from "../other/user-menu";
import { CreateCourseDialog } from "@/Components/dialogs/create-course-dialog";
import { AsideDetail } from "./aside-details";


export const AsidePanelLayout: React.FC<{}> = memo(() => {
    const fetchCourses = useCourseStore(s => s.fetchCourses)
    const {isOpen, isDetailVisible, isSummaryVisible} = useAsideVisibilityStore()

    useLayoutEffect(() => {(fetchCourses())}, [])

    useEffect(() => {
            const handle = (e: KeyboardEvent) => {
                if (e.key === '/') {
                    const {isOpen, setIsOpen} = useAsideVisibilityStore.getState()
                    !isOpen && setIsOpen(true)
                }
            }
    
            document.addEventListener('keypress', handle)
            return () => document.removeEventListener('keypress', handle)
        }, [])


    return(
        <aside 
        className={clsx(
            'max-lg:absolute will-change-[width]',
            'h-dvh shrink-0 z-10',
            isOpen ? 'w-[300px]' : 'w-[60px]'
        )}
        style={{transition: `width cubic-bezier(.4,0,.2,1) ${isOpen ?  '.2s' : '.3s'}`}}
        >
            <div 
            className={clsx(
                'h-full bg-[var(--aside)] border-r-2 p-2 py-4',
                'relative flex flex-row-reverse will-change-[width]',
                'overflow-y-scroll ',
                isOpen ? 'w-[300px] rounded-r-2awxl' : 'w-[60px]'
            )}
            style={{transition: `width cubic-bezier(.4,0,.2,1) ${!isOpen ?  '.2s' : '.3s'}`}}
            >
                <section 
                    className={clsx(
                        'absolute w-[284px] px-2',
                        !isOpen ? 'opacity-0': 'opacity-100'
                    )} 
                    style={{transition: 'opacity .25s cubic-bezier(.97,-0.01,.4,1.02)'}}
                >   
                    {isDetailVisible && 
                        <AsideDetail />
                    }
                </section>
            
                <section className={clsx(
                    'absolute w-[60px] flex',
                    'items-center flex-col h-fit left-0',
                    isOpen ? 'opacity-0': 'opacity-100'
                )} 
                style={{transition: 'opacity .25s cubic-bezier(.97,-0.01,.4,1.02)'}}
                >
                    {isSummaryVisible && 
                        <AsideSummary />
                    }
                </section>
            </div>
        </aside> 
    )
})


const AsideSummary = () => {
    const setIsOpen = useAsideVisibilityStore(s => s.setIsOpen)
    return(
        <>
            <OpenCloseSvg className="" onClick={() => {setIsOpen(true)}} />
        </>
    )
}

