import { JSX, JSXElementConstructor, memo, ReactElement, RefObject, useEffect } from "react"
import { Button } from "./Button"
import { Outlet, useNavigate } from "react-router-dom"

export const SuccessfulModal = memo((props: {ref: RefObject<HTMLDialogElement | null>, labels: [forLabel: string, forButton: string], redirectURI: string, children?: ReactElement }) => {
    const navigator = useNavigate()
    
    return(
        <>
            <dialog className="SuccessfulModal" ref={props.ref} >
                <label>{props.labels[0]}</label>
                {props.children ?? null}
                <Button text={props.labels[1]} isPretty type='submit' onclick={() => navigator('/') } />
            </dialog>
        </>
    )
})