import  { RefObject, useEffect, useRef } from "react";

export function WaitModal (props: {ref: RefObject<HTMLDialogElement | null>, isOpen?: boolean} ) {
    useEffect( () => {
        if (props.isOpen) {  
            props.ref.current?.showModal()
        }
    }, [])
    return(
        <dialog ref={props.ref} className="WaitModal" >
            <div className="WaitModal__container">
                <div id="circle1"></div>
                <div id="circle2"></div>
                <div id="circle3"></div>
                <div id="square"></div>
            </div> 
        </dialog>
    )
}