import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import React, { Dispatch, SetStateAction, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CreatedCourse, FollowedCourse } from "../../types/interfaces";
import { Loader } from '../../Components/ui/Loader'
import {SearchContainer} from '../../Components/ui/SearchContainer'
import { toast, ToastContainer } from "react-toastify";
import { userStore } from "../../stores/userStore";
import { useHomeStore } from "./stores/homeStore";
import { toastContainerIds } from "../../config/toasts.constant";
import { CreatedCoursesSection } from "./Components/CreatedCourseSection";
import { FollowedCourseSection } from "./Components/FollowedCourseSection";


export default function HomePage() {
    const {nick, role} = userStore()
    const {
        init,
        isLoading,
        createStatus,
    } = useHomeStore()

    useLayoutEffect(() => {
        init()
    }, [])

    useEffect(() => { if (createStatus.isCreated) toast.success('Курс успешно создан', {containerId: toastContainerIds.homeContainer})
    }, [createStatus.isCreating])


    if (isLoading) {
        return <Loader /> 
    }
    
    return (
        <div className="teacher-portal">
            <ToastContainer containerId={toastContainerIds.homeContainer} theme='dark' style={{top: "250px",marginLeft: 'auto', right: '100px'}} position='top-right' />

            {role.includes('teacher') && <CreatedCoursesSection /> }

            {role.includes('student') && <FollowedCourseSection /> }
    </div>
    )
}