import { useCourseStore } from "@/stores/useCourseStore"
import { 
    Label, Input, Button, Dialog, 
    DialogClose, DialogContent, 
    DialogDescription, DialogFooter, 
    DialogHeader, DialogTitle, 
    DialogTrigger  
} from "@/Components"
import { FC, memo, useEffect, useId, useState } from "react"
import { userStore } from "@/stores/userStore"
import { useCreateCourse } from "@/hooks/useCreateCourse"
import { PropsVariant } from "@/types/types"


export const CreateCourseDialog: FC<{text: string, className?: string, variant?: PropsVariant}> = memo(({text, className, variant}) => {
    const nick = userStore(s => s.nick)
    const titleId = useId()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const handler = useCreateCourse()
    const fetchCourses  = useCourseStore(s => s.fetchCourses)
    const [isCreating, setIsCreating] = useState<boolean>(false)

    
    useEffect(() => {
        isCreating && handler(titleId, () => {fetchCourses(), setIsOpen(false)}, () => {setIsCreating(false)})
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
                        {`Создать новый курс у пользователя: ${nick}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor={titleId}>Название</Label>
                        <Input id={titleId} name="title"  />
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