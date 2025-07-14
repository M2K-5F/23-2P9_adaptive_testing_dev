import { BrowserRouter, redirect, Route, Routes, useNavigate } from "react-router-dom";
import StudentPortal from "../Pages/forstudent/StudentPage";
import MainLOUT from "../Layouts/MainLOUT";
import Autorize from "../Pages/users/Autorize/Autorize";
import Regisration from "../Pages/users/Registration/Registration";
import ForbiddenPage from "../Pages/errors/HTTP_403";
import ServiceUnavailablePage from "../Pages/errors/HTTP_503";
import TeacherPortal from "../Pages/forteacher/TeacherPortal";
import TopicsPortal from "../Pages/edit/course/EditCoursePortal";
import {CourseViewPage} from '../Pages/view/course/CourseViewPage'


export default function RoutePaths () {
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/403" Component={ForbiddenPage} /> 
          <Route path="/503" Component={ServiceUnavailablePage} />
          <Route path="/*" Component={MainLOUT}>

            <Route path="users/*">
                <Route path="autorize" Component={Autorize}/>
                <Route path="registration" Component={Regisration} />
            </Route>

            <Route path="forstudent" Component={StudentPortal} />

            <Route path="forteacher" Component={TeacherPortal} />

            <Route path="edit/course" Component={TopicsPortal} /> 

            <Route path="course" Component={CourseViewPage} />

          </Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}