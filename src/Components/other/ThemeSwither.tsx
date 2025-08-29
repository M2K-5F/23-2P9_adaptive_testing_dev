import React, { FC, memo, useEffect, useRef } from "react";
import { themeStore } from "../../stores/themeStore";

export const  ThemeSwitcher: FC<{className?: string}> = memo((props) => {
    const {theme, toggleTheme} = themeStore()

    return(
        <>
            <div className={"relative h-8 w-16 " + props.className} onClick={toggleTheme}>
                <img className={"absolute w-16 h-8 rounded-[8rem] border-2 " + (theme === 'dark' ? 'opacity-0' : '')} src="/public/Night.jpg" alt=""></img>
                <img src="/public/Day.jpeg" alt="" className={"absolute w-16 h-8 rounded-[8rem] border-2 " + (theme === 'light' ? 'opacity-0' : '')}/>
            </div>
        </>
    )
})