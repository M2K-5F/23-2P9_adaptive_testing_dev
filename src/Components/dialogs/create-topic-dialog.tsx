import { useCourseStore } from "@/stores/useCourseStore"
import {
    Dialog, DialogClose, DialogContent, 
    DialogDescription, DialogFooter, DialogHeader, 
    DialogTitle, DialogTrigger, 
    Input, Button, Label 
} from "@/Components"
import { useSearchParams } from "react-router-dom"
import { FC, memo, useEffect, useId, useState } from "react"
import { useCreateTopic } from "@/hooks/useCreateTopic"
import { useTopicStore } from "@/stores/useTopicStore"
import { Flashlight } from "lucide-react"
import { PropsVariant } from "@/types/types"

export const CreateTopicDialog: FC<{text: string, className?: string, variant?: PropsVariant}> = memo(({text, className, variant}) => {
    const createdCourses = useCourseStore(s => s.createdCourses)
    const fetchTopics = useTopicStore(s => s.fetchCreatedTopics)
    const courseId = Number(useSearchParams()[0].get('course_id'))
    const [titleId, descriptionId] = [useId(), useId()]
    const createHandler = useCreateTopic()
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    console.log('gjhghcgu');
    useEffect(() => {
        isCreating && createHandler(courseId, titleId, descriptionId, () => {fetchTopics(courseId), setIsOpen(false)}, () => {setIsCreating(false)})
    }, [isCreating])
    

    return(
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={className} onClick={() => {setIsCreating(false)}} variant={variant ?? 'ghost'}>{text}</Button>
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
                    <Button disabled={isCreating} onClick={() => {
                        setIsCreating(true)
                    }}>Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})