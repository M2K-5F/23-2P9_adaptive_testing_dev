import { BrowserRouter, redirect, Route, Routes } from "react-router-dom";
import FormLayout from "../Layouts/StudentLOUT";
import MainLOUT from "../Layouts/MainLOUT";
import Autorize from "../Components/Autorize";
import Regisration from "../Components/Registration";
import MainRedirect from "../Layouts/Redirect";
import ShowForm from "../Components/Form";
import { createBrowserHistory } from "history";
import TeacherLout from "../Layouts/TeacherLOUT";
import Results from "../Components/Results";


export default function RoutePaths () {
  return(
    <>
      <BrowserRouter>
        <Routes>

          <Route path="/*" Component={MainLOUT}>

            <Route path="users/*">
              <Route path="autorize" Component={Autorize}/>
              <Route path="registration" Component={Regisration} />
            </Route>

            <Route path="*" element={<MainRedirect checkAccount={true} /> } >

                <Route path="showForm/">
                    <Route path=":id" Component={ShowForm} />
                </Route>

                <Route path="forstudent" Component={FormLayout} />

                <Route path="forteacher/" Component={TeacherLout} />
                <Route path="forteacher/results/" Component={Results}></Route>

            </Route>

          </Route>

        </Routes>
      </BrowserRouter>
    </>
  )
}