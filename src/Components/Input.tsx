import React, { ChangeEventHandler } from "react"

export const Input = (props: {className?: string, value?: string, required? : boolean, name: string, onChange?: Function, max?: number, min?: number, defaultValue?: string, invalidMessage?:string, isPretty?: boolean, placeholder? : string}) => {
    return(<>
            <input 
            value={props.value}
            type="text" 
            maxLength={props.max ?? 50} 
            minLength={props.min ?? 3} 
            name={props.name}
            defaultValue={props.defaultValue} 
            className={`${props.isPretty ? 'pretty_input' : 'main_input'} ${props.className ?? ''}`}
            onInvalid={e => {
                e.preventDefault()
                e.currentTarget.classList.remove('invalid')
                e.currentTarget.offsetWidth
                e.currentTarget.classList.add('invalid')
            }}
            placeholder={props.placeholder ?? props.name} 
            onChange={e => {
                const label = document.querySelector(`input[name=${props.name}] + label`) as HTMLLabelElement
                label.innerHTML = props.invalidMessage ?? 'Некорректное значение'
                if (props.name === 'password') {
                    (document.querySelector('[name=repeat]') ?? undefined)?.classList.remove('invalid')
                }
                e.currentTarget.classList.remove('invalid')
                props.onChange 
                    ? props.onChange(e) 
                    : undefined
            }} required={props.required}
            />

            <label className="valid_message">{props.invalidMessage ?? 'invalid field'}</label>
        </>
    )
}