import { BrowserRouter, redirect, Route, Routes, useNavigate } from "react-router-dom";
import { RedirectWrapper } from "../Layouts/RedirectWrapper";
import Autorize from "../Pages/users/Autorize/Autorize";
import Regisration from "../Pages/users/Registration/Registration";
import ForbiddenPage from "../Pages/errors/HTTP_403";
import ServiceUnavailablePage from "../Pages/errors/HTTP_503";
import HomePage from "../Pages/home/HomePage";
import {TopicsPortal }from "../Pages/edit/course/EditCoursePage";
import { FollowedCoursePage } from '../Pages/course/CourseViewPage'
import { useUserStore } from "../stores/useUserStore";
import { use, useLayoutEffect } from "react";
import { AppLayout } from "@/Layouts/AppLayout";
import { AuthLayout } from "@/Layouts/AuthLayout";
import { TopicPage } from "@/Pages/topic/PassTopicPage";
import { Toaster } from "sonner";
import { CourseStatisticsPage } from "@/Pages/stats/course/CourseStatsPage";
import NotFoundPage from "@/Pages/errors/HTTP_404";


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