import { AsidePanelLayout } from "@/Components/ui/aside"
import { FC } from "react"
import { Outlet } from "react-router-dom"

export const AppLayout: FC = () => {
    return(
        <div className="flex">
            <AsidePanelLayout /> 
            <Outlet />
        </div>
    )
}