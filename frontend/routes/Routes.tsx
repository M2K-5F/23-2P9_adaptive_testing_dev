import { BrowserRouter, redirect, Route, Routes, useNavigate } from "react-router-dom";
import { RedirectWrapper } from "../layouts/RedirectWrapper";
import Autorize from "../pages/users/Autorize/Autorize";
import Regisration from "../pages/users/Registration/Registration";
import ForbiddenPage from "../pages/errors/HTTP_403";
import ServiceUnavailablePage from "../pages/errors/HTTP_503";
import HomePage from "../pages/home/HomePage";
import {TopicsPortal }from "../pages/edit/course/EditCoursePage";
import { FollowedCoursePage } from '../pages/course/CourseViewPage'
import { useUserStore } from "../stores/useUserStore";
import { use, useLayoutEffect } from "react";
import { AppLayout } from "@/layouts/AppLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { TopicPage } from "@/pages/topic/PassTopicPage";
import { Toaster } from "sonner";
import { CourseStatisticsPage } from "@/pages/stats/course/CourseStatsPage";
import NotFoundPage from "@/pages/errors/HTTP_404";


export default function RoutePaths () {
  const pingUser = useUserStore(s => s.pingUser)

  useLayoutEffect(() => {
    pingUser()
  }, [])


  return(
    <>
      <Toaster position='top-center' />
      <BrowserRouter >
        <Routes>
          <Route path="/403" Component={ForbiddenPage} /> 
          <Route path="/503" Component={ServiceUnavailablePage} />
          <Route path="/topic" Component={TopicPage} />
          <Route path="" Component={RedirectWrapper}>

            <Route path="/users/*" Component={AuthLayout}>
                <Route path="autorize" Component={Autorize}/>
                <Route path="registration" Component={Regisration} />
            </Route>

            <Route path="/" Component={AppLayout}>
              <Route index Component={HomePage} />
              <Route path="edit/course" Component={TopicsPortal} />
              <Route path="course" Component={FollowedCoursePage} />
              <Route path="stats/course" Component={CourseStatisticsPage} />
            </Route>

          </Route>
          
              <Route path="*" Component={NotFoundPage} />
        </Routes>
      </BrowserRouter>
    </>
  )
}