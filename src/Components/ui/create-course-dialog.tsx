import { useCourseStore } from "@/stores/useCourseStore"
import { Button } from "./button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Label } from "./label"
import { Input } from "./input"
import { FC, memo, useId, useState } from "react"
import { userStore } from "@/stores/userStore"
import { useCreateCourse } from "@/hooks/useCreateCourse"
type PropsVariant = "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"

export const CreateCourseDialog: FC<{text: string, className?: string, variant?: PropsVariant}> = memo(({text, className, variant}) => {
    const nick = userStore(s => s.nick)
    const titleId = useId()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const handler = useCreateCourse()
    const fetchCourses  = useCourseStore(s => s.fetchCourses)


    return(
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={className} variant={variant ?? 'ghost'}>{text}</Button>
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
                    <Button onClick={() => handler( titleId, () => {fetchCourses(), setIsOpen(false)})} >Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})