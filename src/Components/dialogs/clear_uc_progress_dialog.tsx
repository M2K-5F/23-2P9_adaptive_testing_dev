import { useCourseStore } from "@/stores/useCourseStore"
import { 
    Label, Input, Button, Dialog, 
    DialogClose, DialogContent, 
    DialogDescription, DialogFooter, 
    DialogHeader, DialogTitle, 
    DialogTrigger,  
    Badge
} from "@/Components"
import { FC, memo, useEffect, useId, useState } from "react"
import { PropsVariant } from "@/types/types"
import { set } from "react-hook-form"
import { RotateCcw } from "lucide-react"
import { clearUCProgress } from "@/services/api.service"
import { toast } from "sonner"
import { useTopicStore } from "@/stores/useTopicStore"


export const ClearUCProgressDialog: FC<{className?: string, variant?: PropsVariant, userCourseId: number, isBadge?: boolean, callback: (id: number) => void}> = memo(({isBadge, userCourseId, className, variant, callback}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isClearing, setIsClearing] = useState<boolean>(false)
    const fetchFollowedTopics = useTopicStore(s => s.fetchFollowedTopics)

    const handleClear = async () => {
        try {
            await clearUCProgress(userCourseId)
            toast.success('Прогресс успешно сброшен!')
            callback(userCourseId)
            setIsOpen(false)
        } catch {
            toast.error('Не удалось сбросить прогресс.')
            setIsClearing(false)
        }
    }
    
    useEffect(() => {
        isClearing && handleClear()
    }, [isClearing])


    return(
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {isBadge
                    ?   <Badge
                            variant="secondary"
                            onClick={() => setIsClearing(false)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="min-md:hidden">Сбросить прогресс</span>
                        </Badge>
                    :   <Button
                            variant="outline"
                            onClick={() => setIsClearing(false)}
                            className="flex items-center gap-2 text-destructive hover:text-destructive"
                        >
                            <RotateCcw className="h-4 w-4" />
                            <span className="max-md:hidden">Сбросить прогресс</span>
                        </Button>
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Сброс курса
                    </DialogTitle>
                    <DialogDescription>
                        Вы уверены что хотите сбросить прогресс курса?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)} variant={'outline'}>Нет, не сбрасывать</Button>
                    <Button className="text-red-500 border-red-500 bg-red-300" disabled={isClearing} onClick={() => setIsClearing(true)} >Да, сбросить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})