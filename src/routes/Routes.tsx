import { BrowserRouter, redirect, Route, Routes, useNavigate } from "react-router-dom";
import MainLOUT from "../Layouts/MainLOUT";
import Autorize from "../Pages/users/Autorize/Autorize";
import Regisration from "../Pages/users/Registration/Registration";
import ForbiddenPage from "../Pages/errors/HTTP_403";
import ServiceUnavailablePage from "../Pages/errors/HTTP_503";
import HomePage from "../Pages/home/HomePage";
import TopicsPortal from "../Pages/edit/course/EditCoursePortal";
import {CourseViewPage} from '../Pages/view/course/CourseViewPage'
import { userStore } from "../stores/userStore";
import { useLayoutEffect } from "react";


export default function RoutePaths () {
  const {pingUser} = userStore()

  useLayoutEffect(() => {
    pingUser()
  }, [])
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/403" Component={ForbiddenPage} /> 
          <Route path="/503" Component={ServiceUnavailablePage} />
          <Route path="/*" Component={MainLOUT}>

            <Route index Component={HomePage} /> 

            <Route path="users/*">
                <Route path="autorize" Component={Autorize}/>
                <Route path="registration" Component={Regisration} />
            </Route>

            <Route path="edit/course" Component={TopicsPortal} /> 

            <Route path="course" Component={CourseViewPage} />

          </Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}