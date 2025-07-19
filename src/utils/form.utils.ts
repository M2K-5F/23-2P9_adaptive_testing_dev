export const ThrowMsg = ( name: string, message?: string, formElement?: HTMLFormElement) => {
    if (message) {
        const label = document.querySelector(`[name=${name}] + label`) as HTMLLabelElement
        label.innerHTML = message
    }

    const element: HTMLElement = (formElement ?? document).querySelector(`[name=${name}]`)!
    element?.classList.remove('invalid')
    element?.offsetWidth
    element?.classList.add('invalid')
    element?.offsetWidth
}
