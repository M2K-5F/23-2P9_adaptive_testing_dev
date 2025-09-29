export const useFlexOrder = (index: number, expanded: boolean) => {
    const columns = window.innerWidth >= 725 ? 3 : 2
        const order = index * 2
    
        if (expanded && index % columns === 1) {
                return order - 3
        }
    
        if (expanded && index % 3 === 2) {
                return order + 3
        }

        return order
}