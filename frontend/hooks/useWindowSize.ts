import { useState, useEffect } from 'react';

export default function useWindowSize() {
    const [size, setSize] = useState<{width: number, height: number}>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handleResize, {passive: true})
        return () => window.removeEventListener('resize', handleResize)
    }, []);

    return size;
}