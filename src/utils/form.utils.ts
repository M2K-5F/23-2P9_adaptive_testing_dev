export const ThrowMsg = ( name: string, message?: string, formElement?: HTMLFormElement) => {
    if (message) {
        const label = document.querySelector(`input[name=${name}] + label`) as HTMLLabelElement
        label.innerHTML = message
    }

    const element: HTMLInputElement = (formElement ?? document).querySelector(`[name=${name}]`)!
    element?.classList.remove('invalid')
    element?.offsetWidth
    element?.classList.add('invalid')
    element?.offsetWidth
}
