import { RefObject, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => any>(debounceFunction: T, delay: number = 500): (...args: Parameters<T>) => void {
    const timer = useRef<number>(0)
    return (...args: Parameters<T>) => {
        clearTimeout(timer.current)
        timer.current = setTimeout(() => debounceFunction(...args), delay)
    }
}