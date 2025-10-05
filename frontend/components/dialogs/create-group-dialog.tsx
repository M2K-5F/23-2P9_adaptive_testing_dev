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
import { NotebookPen, Plus } from "lucide-react"
import { useImmer } from "use-immer"
import { useCreateGroup } from "@/hooks/useCreateGroup"
import { GroupCreate } from "@/types/interfaces"


export const CreateGroupDialog: FC<{courseId: number, callback: () => void}> = memo(({courseId, callback}) => {
    const createdCourses = useCourseStore(s => s.createdCourses)
    const createHandler = useCreateGroup()
    const [group, setGroup] = useImmer<GroupCreate>({
        title: '', 
        max_student_count: '20',
        course_id: courseId,
        type: 'public',
        profile: 'Balanced',
        passkey: ''
    })
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isCreating, setIsCreating] = useState<boolean>(false)
    

    useEffect(() => {
        isCreating && createHandler(
            group,
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
                            value={group.title}
                            onChange={(e) => {setGroup(d => {d.title = e.currentTarget.value})}}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2">
                    <div className="grid gap-2">
                        <Label className="h-fit" htmlFor={''}>Максимальное количество студентов:</Label>
                        <Select onValueChange={(value => {setGroup(d => {d.max_student_count = value})})} value={group.max_student_count.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder='Количество' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Количество</SelectLabel>
                                    {Array.from(['5', '10', '15', '20', '25', '30']).map((score) => {
                                        return <SelectItem value={score}>{score}</SelectItem>
                                    })
                                    }
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="profile"  className="">Профиль адаптивности группы:</Label>
                        <Select
                            value={group.profile}
                            onValueChange={(v: 'Aggressive' | 'Balanced' | 'Gentle') => {
                                setGroup(d => {
                                    d.profile = v
                                })
                            }}
                        >
                            <SelectTrigger  id="profile" className='' >
                                <SelectValue placeholder='Тип вопроса' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>
                                        Профиль
                                    </SelectLabel>
                                    <SelectItem value="Aggressive">Реактивный</SelectItem>
                                    <SelectItem value="Balanced">Сбалансированный</SelectItem>
                                    <SelectItem value="Gentle">Консервативный</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="type"  className="">Тип группы:</Label>
                        <Select
                            value={group.type}
                            onValueChange={(v: 'private' | 'public') => {
                                setGroup(d => {
                                    d.type = v
                                })
                            }}
                        >
                            <SelectTrigger  id="type" className='' >
                                <SelectValue placeholder='Тип группы' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>
                                        Тип
                                    </SelectLabel>
                                    <SelectItem value="private">Приватная</SelectItem>
                                    <SelectItem value="public">Публичная</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {group.type === 'private' &&
                        <div className="grid gap-2">
                            <Label htmlFor="pasaskey">Кодовое слово:</Label>
                            <Input 
                                maxLength={16} 
                                id="passkey" 
                                value={group.passkey} 
                                onChange={(e) => 
                                    setGroup(d => {
                                        d.passkey = e.currentTarget.value
                                    })
                                }/>
                        </div>
                    }
                </div>

                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)} variant={'outline'}>Закрыть</Button>
                    <Button disabled={isCreating} onClick={() => setIsCreating(true)} >Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})