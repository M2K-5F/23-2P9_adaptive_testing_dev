import { useCourseStore } from "@/stores/useCourseStore"
import { Button } from "./button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { useSearchParams } from "react-router-dom"
import { Label } from "./label"
import { Input } from "./input"
import { FC, memo, useId } from "react"
import { useCreateTopic } from "@/hooks/useCreateTopic"

export const CreateTopicDialog: FC<{text: string, className?: string, variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost"}> = memo(({text, className, variant}) => {
    const createdCourses = useCourseStore(s => s.createdCourses)
    const courseId = Number(useSearchParams()[0].get('course_id'))
    const [titleId, descriptionId] = [useId(), useId()]
    const createHandler = useCreateTopic()


    return(
        <Dialog>
            <DialogTrigger asChild>
                <Button className={className} variant={variant ?? 'ghost'}>{text}</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Создание темы
                    </DialogTitle>
                    <DialogDescription>
                        {`Создать новую тему в курсе: ${createdCourses.find(c => c.id === courseId)?.title ?? ''}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor={titleId}>Название</Label>
                        <Input id={titleId} name="title"  />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor={descriptionId}>Описание</Label>
                        <Input id={descriptionId} name="description" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'outline'}>Закрыть</Button>
                    </DialogClose>
                    <Button onClick={() => createHandler(courseId, titleId, descriptionId)} >Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})