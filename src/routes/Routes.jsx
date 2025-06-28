import { BrowserRouter, redirect, Route, Routes, useNavigate } from "react-router-dom";
import StudentPortal from "../Pages/StudentPage";
import MainLOUT from "../Layouts/MainLOUT";
import Autorize from "../Pages/Autorize";
import Regisration from "../Pages/Registration";
import MainRedirect from "../Layouts/Redirect";
import ShowForm from "../Pages/Form";
import Results from "../Pages/Results";
import Createform from "../Pages/CreateForm";
import ForbiddenPage from "../Pages/errors/HTTP_403";
import ServiceUnavailablePage from "../Pages/errors/HTTP_503";
import TeacherPortal from "../Pages/TeacherPortal";
import TopicsPortal from "../Pages/EditCoursePortal";


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


          </Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}