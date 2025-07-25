import React, { useEffect, useRef } from "react";
import { themeStore } from "../stores/themeStore";

export function ThemeSwitcher () {
    const {theme, toggleTheme} = themeStore()

    return(
        <>
            <div className={`swither ${theme === 'light' && 'switcher-on'}`} onClick={toggleTheme}>
                <div className="switcher-circle circle" />
                <div className="switcher-circle" />
            </div>
        </>
    )
}