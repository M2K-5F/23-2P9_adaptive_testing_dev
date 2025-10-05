import { useCourseStore } from "@/stores/useCourseStore"
import { 
    Label, Input, Button, Dialog, 
    DialogClose, DialogContent, 
    DialogDescription, DialogFooter, 
    DialogHeader, DialogTitle, 
    DialogTrigger,  
    Loader,
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components"
import { getCreatedGroups,archGroup, unarchGroup, getFollowedGroups, getGroupsByCourse, followGroup } from "@/services/group"
import { FC, memo, useEffect, useState } from "react"
import { UsersRound, Archive, ArchiveRestore, Plus, Users, User, Calendar, LogOut, LockKeyhole, LockKeyholeOpen, Trophy, Radar } from "lucide-react"
import { CreatedGroup, FetchedGroup, UserGroup } from "@/types/interfaces"
import clsx from "clsx"
import { CreateGroupDialog } from "./create-group-dialog"
import { toast } from "sonner"


export const FollowGroupDialog: FC<{courseId: number, user_group: false|UserGroup, followCallback: () => void}> = memo(({
    courseId,
    user_group,
    followCallback
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isLoading, setLoading] = useState(false)
    const [groupList, setGroups] = useState<FetchedGroup[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const followHandler = (callback: () => Promise<void>) => {
        callback()
        .then(() => {
            followCallback()
            setIsOpen(false)
        })
    }

    const fetchGroups = async () => {
        setLoading(true)
        try {
            setGroups(await getGroupsByCourse(courseId))
        } finally {
            setLoading(false)
        }
    }    

    const filteredGroups = groupList.filter(group =>
        group.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeGroups = filteredGroups.filter(group => group.is_active)


    useEffect(() => {
        if (isOpen) {
            fetchGroups()
        }
    }, [courseId, isOpen])


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={user_group ? "destructive" : "default"}
                    size="sm"
                    className="flex items-center gap-1 max-w-80 w-full"
                >{user_group
                    ?   <>
                            <LogOut className="h-4 w-4" />
                            Отписаться
                        </>
                    :   <>
                            <Plus className="h-4 w-4" />
                            Подписаться
                        </>
                }
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UsersRound className="w-5 h-5" />
                        Группы курса "{groupList[0]?.by_course?.title || 'Неизвестно'}"
                    </DialogTitle>
                    <DialogDescription>
                        Подписаться на группу. Всего групп: {groupList.length}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Поиск по названию группы..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                
                <div className="flex-1 overflow-y-auto scrollbar-hidden">
                    {isLoading 
                        ?   <div className="flex justify-center py-8">
                                <Loader variant="success" />
                            </div>
                        :   <div className="space-y-6">
                                {activeGroups.length > 0 && 
                                    <section>
                                        <h3 className="text-lg font-semibold mb-3 text-green-600 flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Активные группы ({activeGroups.length})
                                        </h3>
                                        <div className="grid gap-4">
                                            {activeGroups.map(group => (
                                                <GroupCard 
                                                    key={group.id} 
                                                    followHandler={followHandler}
                                                    group={group}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                }

                                {filteredGroups.length === 0 && 
                                    <div className="text-center py-8 text-gray-500">
                                        <UsersRound className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Группы не найдены</p>
                                        {searchQuery && 
                                            <p className="text-sm">Попробуйте изменить условия поиска</p>
                                        }
                                    </div>
                                }
                            </div>
                    }
                </div>

                <DialogFooter className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Всего: {filteredGroups.length} гр.
                    </div>
                    <DialogClose asChild>
                        <Button variant="outline">Закрыть</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})


interface GroupCardProps {
    group: CreatedGroup
    followHandler: (callback: () => Promise<void>) => void
}

const GroupCard: FC<GroupCardProps> = ({group, followHandler}) => {
    return (
        <Card className={clsx(
            "border-l-4 transition-all hover:shadow-md",
            group.is_active 
                ? "border-l-green-500" 
                : "border-l-gray-400 opacity-75"
        )}>
            <CardHeader className="pb-3">
                <div className="flex justify-between flex-col items-start gap-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {group.title}
                        <Badge variant={group.is_active ? "default" : "secondary"}>
                            {group.is_active ? "Активна" : "В архиве"}
                        </Badge>
                    </CardTitle>
                    <div className="flex flex-wrap justify-center gap-2">
                        {group.type === 'public'
                            ?   <Button
                                    variant={'default'}
                                    onClick={() => 
                                        followHandler(() => {
                                            return followGroup(group.id)
                                                .catch((err) => {
                                                    toast('Не удалось подписаться на группу')
                                                    throw err
                                                })
                                        })
                                    }
                                    size="sm"
                                    className="flex items-center gap-1 bg-green-300"
                                >
                                    <Plus className="h-4 w-4" />
                                    Подписаться
                                </Button>
                            :   <PrivateGroupFollowDialog group={group} followHandler={followHandler}/>
                        }
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="pt-0">
                <div className="flex flex-wrap justify-around gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="shrink-0 w-4 h-4 text-blue-500" />
                        <span>
                            Студентов: <br /><strong>{group.student_count}</strong> / {group.max_student_count}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {group.type === 'private'
                            ?   <LockKeyhole className="w-4 h-4 text-orange-500"/>
                            :   <LockKeyholeOpen className="w-4 h-4 text-green-500"/>
                        }
                        <span>Тип: <br /> <strong>{group.type === 'private' ? 'Приватная' : 'Публичная'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Radar className="shrink-0 w-4 h-4 text-amber-500"/>
                        <span>Профиль: <br /> 
                            <strong>
                                {group.profile.name === 'Aggressive'
                                    ?  'Реактивный'
                                    :   group.profile.name === 'Balanced'
                                        ?   'Сбалансированный'
                                        :   'Консервативный'
                                }
                            </strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <User className="shrink-0 w-4 h-4 text-purple-500" />
                        <span>Создатель: <br /><strong>{group.created_by.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="shrink-0 w-4 h-4 text-green-500" />
                        <span>Курс: <br /> <strong>{group.by_course.title}</strong></span>
                    </div>
                    
                    
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        <span>ID: {group.id}</span>
                        <span>Курс ID: {group.by_course.id}</span>
                        {group.by_course.created_at && 
                            <span>Создан: {new Date(group.by_course.created_at).toLocaleDateString('ru-RU')}</span>
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


export const PrivateGroupFollowDialog: FC<{
    group: CreatedGroup, 
    followHandler: (callback: () => Promise<void>) => void
}> = ({group, followHandler}) => {
    const [passkey, setPasskey] = useState<string>('')
    const [open, setOpen] = useState(false)


    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={'default'}
                    size="sm"
                    className="flex items-center gap-1 bg-green-300"
                >
                    <Plus className="h-4 w-4" />
                    Подписаться
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Подписка на группу
                    </DialogTitle>
                    <DialogDescription>
                        Для подписки на группу {group.title} требуется кодовое слово
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor='passkey' >Кодовое слово:</Label>
                        <Input id='passkey' name="passkey" value={passkey} onChange={e => setPasskey(e.currentTarget.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => setOpen(false)} variant={'outline'}>Закрыть</Button>
                    <Button 
                        onClick={() => {
                            if (passkey.length < 3) {
                                toast('Кодовое слово не может быть короче 3 символов')
                                return
                            }

                            followHandler(() => {
                                return followGroup(group.id, passkey)
                                    .then(() => setOpen(false))
                                    .catch((err) => {
                                        toast('Неверное кодовое слово')
                                        throw err
                                    })
                            })
                        }}
                    >Подписаться</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}