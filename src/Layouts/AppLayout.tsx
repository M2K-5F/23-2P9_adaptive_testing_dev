import { AsidePanelLayout } from "@/Components/ui/aside"
import { FC, memo } from "react"
import { Outlet } from "react-router-dom"

export const AppLayout: FC = memo(() => {
    return(
        <div className="flex">
            <AsidePanelLayout /> 
            <Outlet />
        </div>
    )
})