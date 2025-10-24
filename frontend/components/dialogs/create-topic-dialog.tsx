import { useCourseStore } from "@/stores/useCourseStore"
import {
    Dialog, DialogClose, DialogContent, 
    DialogDescription, DialogFooter, DialogHeader, 
    DialogTitle, DialogTrigger, 
    Input, Button, Label, 
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from "@/components"
import { useSearchParams } from "react-router-dom"
import { FC, memo, useEffect, useId, useState } from "react"
import { useCreateTopic } from "@/hooks/useCreateTopic"
import { useTopicStore } from "@/stores/useTopicStore"
import { Flashlight } from "lucide-react"
import { PropsVariant } from "@/types/types"
import { useImmer } from "use-immer"

export const CreateTopicDialog: FC<{text: string, className?: string, variant?: PropsVariant}> = memo(({text, className, variant}) => {
    const createdCourses = useCourseStore(s => s.createdCourses)
    const fetchTopics = useTopicStore(s => s.fetchCreatedTopics)
    const courseId = Number(useSearchParams()[0].get('course_id'))
    const createHandler = useCreateTopic()
    const [data, setData] = useImmer<{title: string, description: string, score: string}>({title: '', description: '', score: '0.8'})
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    
    useEffect(() => {
        isCreating && createHandler(
            courseId, 
            data, 
            () => {
                fetchTopics(courseId)
                setIsOpen(false)
            }, 
            () => {
                setIsCreating(false)
            }
        )
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
                        <Label htmlFor="title">Название</Label>
                        <Input 
                            value={data.title} 
                            id="title" 
                            name="title"  
                            onChange={(e) => {
                                setData(d => {
                                    d.title = e.currentTarget.value
                                })
                            }}
                        />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="desc">Описание</Label>
                        <Input 
                            value={data.description} 
                            id="desc" 
                            name="description" 
                            onChange={(e) => {
                                setData(d => {
                                    d.description = e.currentTarget.value
                                })
                            }}
                        />
                    </div>

                    <div className="flex gap-3">
                        <Label htmlFor={''}>Баллы для прохождения:</Label>
                        <Select onValueChange={(value => {setData(d => {d.score = value})})} value={data.score}>
                            <SelectTrigger>
                                <SelectValue placeholder={'Баллы'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Баллы</SelectLabel>
                                    {Array.from(['0.5', '0.6', '0.7', '0.8', '0.9', '0.95', '1.0' ]).map((score) => {
                                        return <SelectItem key={score} value={score}>{score}</SelectItem>
                                    })
                                    
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
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