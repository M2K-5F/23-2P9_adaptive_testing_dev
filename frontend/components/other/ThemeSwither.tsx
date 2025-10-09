import React, { FC, memo, useEffect, useRef } from "react";
import { themeStore } from "../../stores/themeStore";
import clsx from "clsx";

export const  ThemeSwitcher: FC<{className?: string}> = memo((props) => {
    const {theme, toggleTheme} = themeStore()

    return(
        <>
            <div className={"relative h-8 w-16" + props.className} onClick={toggleTheme}>
                <div className=" rounded-[8rem]">    
                    <img 
                        src="/images/Day.jpeg"
                        className={clsx(
                            'rounded-[8rem] border-2 w-16 h-8' ,
                            theme === 'dark' && 'hidden'
                        )} 
                    />
                    <img
                        src="/images/Night.jpg"
                        className={clsx(
                            'border-2 rounded-[8rem] w-16 h-8',
                            theme === 'light' && 'hidden'
                        )}
                    />
                </div>
                <div 
                    style={{transition: 'all .5s ease'}}
                    className={clsx(
                        'absolute w-5 h-5 rounded-[50%] top-1.5 border',
                        theme === 'dark' ? 'ml-2 bg-gray-300' : 'ml-9 bg-amber-300'
                    )}  
                />
            </div>
        </>
    )
})