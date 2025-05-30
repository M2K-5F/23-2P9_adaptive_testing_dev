import React, { useEffect, useRef } from "react";
import { themeStore } from "../Static/store";

export default function ThemeSwitcher () {
    const {init, toggleTheme} = themeStore()
    const switcher = useRef()
    useEffect(() => {
        if (init()) {
            switcher.current.classList.remove('switcher-on')
        }
    }, [])

    const toggle = () => {
        switcher.current.classList.toggle('switcher-on')
        toggleTheme()
    }


    return(
        <>
            <div className="switcher switcher-on" onClick={toggle} ref={switcher}>
                <div className="switcher-circle circle" />
                <div className="switcher-circle" />
            </div>
        </>
    )
}