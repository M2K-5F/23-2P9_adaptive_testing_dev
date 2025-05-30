import { MouseEvent, MouseEventHandler } from "react"

export const Button = (props: {
    isPretty?: boolean, 
    text: string, 
    type: "submit" | "reset" | "button" | undefined, 
    onclick?: (event: MouseEvent) => void
    className?: string
}) => {
    
    return(
        <button onClick={(event: MouseEvent) => props.onclick ? props.onclick(event) : null} type={props.type} className={`${props.isPretty ? 'pretty_button' : 'main_button'} ${props.className}`}>{props.text}</button>
    )
}