import { useCourseStore } from "@/stores/useCourseStore"
import { 
    Label, Input, Button, Dialog, 
    DialogClose, DialogContent, 
    DialogDescription, DialogFooter, 
    DialogHeader, DialogTitle, 
    DialogTrigger  
} from "@/components"
import { FC, memo, useEffect, useId, useState } from "react"
import { useUserStore } from "@/stores/useUserStore"
import { useCreateCourse } from "@/hooks/useCreateCourse"
import { PropsVariant } from "@/types/types"


export const CreateCourseDialog: FC<{text: string, className?: string, variant?: PropsVariant}> = memo(({text, className, variant}) => {
    const username = useUserStore(s => s.username)
    const [titleId, descriptionId] = [useId(), useId()]
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const handler = useCreateCourse()
    const fetchCourses  = useCourseStore(s => s.fetchCourses)
    const [isCreating, setIsCreating] = useState<boolean>(false)

    
    useEffect(() => {
        isCreating && handler([titleId, descriptionId], () => {fetchCourses(), setIsOpen(false)}, () => {setIsCreating(false)})
    }, [isCreating])


    return(
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={className} onClick={() => setIsCreating(false)} variant={variant ?? 'ghost'}>{text}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Создание курса
                    </DialogTitle>
                    <DialogDescription>
                        {`Создать новый курс у пользователя: ${username}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor={titleId}>Название:</Label>
                        <Input id={titleId} name="title"  />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor={descriptionId}>Описание:</Label>
                        <Input id={descriptionId} name="description"  />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)} variant={'outline'}>Закрыть</Button>
                    <Button disabled={isCreating} onClick={() => setIsCreating(true)} >Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})