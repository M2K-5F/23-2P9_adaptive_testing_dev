import { useCourseStore } from "@/stores/useCourseStore"
import { 
    Label, Input, Button, Dialog, 
    DialogClose, DialogContent, 
    DialogDescription, DialogFooter, 
    DialogHeader, DialogTitle, 
    DialogTrigger,  
    SelectValue,
    Select,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from "@/components"
import { FC, memo, useEffect, useId, useState } from "react"
import { Plus } from "lucide-react"
import { useImmer } from "use-immer"
import { useCreateGroup } from "@/hooks/useCreateGroup"


export const CreateGroupDialog: FC<{courseId: number, callback: () => void}> = memo(({courseId, callback}) => {
    const createdCourses = useCourseStore(s => s.createdCourses)
    const createHandler = useCreateGroup()
    const [formData, setData] = useImmer<{title: string, max_count: number}>({title: '', max_count: 20})
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    

    useEffect(() => {
        isCreating && createHandler(
            courseId, 
            formData, 
            () => {
                callback()
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
                <Button onClick={() => {}}>
                    <Plus className="w-4 h-4 mr-2"/>
                    Создать группу
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Создание группы
                    </DialogTitle>
                    <DialogDescription>
                        {`Создать новую группу в курсе ${createdCourses.find(c => c.id === courseId)?.title ?? 'course'}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="title" >Название:</Label>
                        <Input 
                            id="title" 
                            name="title"  
                            value={formData.title}
                            onChange={(e) => {setData(d => {d.title = e.currentTarget.value})}}
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                        <Label htmlFor={''}>Максимальное количество студентов:</Label>
                        <Select onValueChange={(value => {setData(d => {d.max_count = Number(value)})})} value={formData.max_count.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder='Количество' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Количество</SelectLabel>
                                    {Array.from([5, 10, 15, 20, 25, 30]).map((score) => {
                                        return <SelectItem value={score.toString()}>{score}</SelectItem>
                                    })
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)} variant={'outline'}>Закрыть</Button>
                    <Button disabled={isCreating} onClick={() => setIsCreating(true)} >Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})