import React, { useEffect, useRef } from "react";
import { themeStore } from "../../stores/themeStore";

export function ThemeSwitcher () {
    const {theme, toggleTheme} = themeStore()

    return(
        <>
            <div className="relative h-8 w-16" onClick={toggleTheme}>
                <img className={"absolute w-16 h-8 rounded-[8rem] border-2 " + (theme === 'dark' ? 'opacity-0' : '')} src="/Night.jpg" alt=""></img>
                <img src="/Day.jpeg" alt="" className={"absolute w-16 h-8 rounded-[8rem] border-2 " + (theme === 'light' ? 'opacity-0' : '')}/>
            </div>
        </>
    )
}