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
import { getCreatedGroups,archGroup, unarchGroup } from "@/services/group"
import { FC, memo, useEffect, useState } from "react"
import { useUserStore } from "@/stores/useUserStore"
import { UsersRound, Archive, ArchiveRestore, Plus, Users, User, Calendar, Loader2 } from "lucide-react"
import { CreatedGroup } from "@/types/interfaces"
import clsx from "clsx"
import { CreateGroupDialog } from "./create-group-dialog"
import { QuestionWeightsDialog } from "./question-weight-dialog"

interface ViewGroupDialogProps {
}

export const ViewGroupDialog: FC<{courseId: number, className?: string}> = memo(({
    courseId, 
    className
}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isLoading, setLoading] = useState(false)
    const [groupList, setGroups] = useState<CreatedGroup[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const archHandler = (groupId: number) => {
        return archGroup(groupId).then(fetchGroups)
    }

    const unarchHandler = (groupId: number) => {
        return unarchGroup(groupId).then(fetchGroups)
    }

    const fetchGroups = async () => {
        setLoading(true)
        try {
            const groups = await getCreatedGroups(courseId)
            setGroups(groups)
        } catch (error) {
            console.error("Ошибка при загрузке групп:", error)
            setGroups([])
        } finally {
            setLoading(false)
        }
    }    

    const filteredGroups = groupList.filter(group =>
        group.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeGroups = filteredGroups.filter(group => group.is_active)
    const archivedGroups = filteredGroups.filter(group => !group.is_active)


    useEffect(() => {
        if (isOpen) {
            fetchGroups()
        }
    }, [courseId, isOpen])


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className={className}>
                    <UsersRound className="w-4 h-4 mr-2" />
                    Список групп
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UsersRound className="w-5 h-5" />
                        Группы курса "{groupList[0]?.by_course?.title || 'Неизвестно'}"
                    </DialogTitle>
                    <DialogDescription>
                        Управление группами курса. Всего групп: {groupList.length}
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
                    <CreateGroupDialog courseId={courseId} callback={fetchGroups} />
                </div>

                
                <div className="flex-1 overflow-y-auto scrollbar-hidden">
                    {isLoading && groupList.length < 1
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
                                                    group={group} 
                                                    onArchive={archHandler}
                                                    onUnarchive={unarchHandler}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                }

                                {archivedGroups.length > 0 && 
                                    <section>
                                        <h3 className="text-lg font-semibold mb-3 text-gray-500 flex items-center gap-2">
                                            <Archive className="w-5 h-5" />
                                            Архивные группы ({archivedGroups.length})
                                        </h3>
                                        <div className="grid gap-4">
                                            {archivedGroups.map(group => (
                                                <GroupCard 
                                                    key={group.id} 
                                                    group={group} 
                                                    onArchive={archHandler}
                                                    onUnarchive={unarchHandler}
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
    onArchive: (groupId: number) => Promise<void>
    onUnarchive: (groupId: number) => Promise<void>
}

const GroupCard: FC<GroupCardProps> = ({onArchive, onUnarchive, group}) => {
    const [loading, setLoading] = useState<boolean>(false)


    return (
        <Card className={clsx(
            "border-l-4 transition-all hover:shadow-md",
            group.is_active 
                ? "border-l-green-500" 
                : "border-l-gray-400 opacity-75"
        )}>
            <CardHeader className="pb-3">
                <div className="flex justify-between flex-wrap items-start gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        {group.title}
                        <Badge variant={group.is_active ? "default" : "secondary"}>
                            {group.is_active ? "Активна" : "В архиве"}
                        </Badge>
                    </CardTitle>
                    <div className="flex flex-wrap justify-center gap-2">
                        <QuestionWeightsDialog groupId={group.id} />
                        {group.is_active 
                            ?   <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setLoading(true)
                                        onArchive(group.id)
                                        .finally(() => setLoading(false))
                                    }}
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                >
                                    {loading
                                        ?   <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        :   <Archive className="w-4 h-4 mr-1" />
                                    }
                                    В архив
                                </Button>
                            :   <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                        setLoading(true)
                                        onUnarchive(group.id)
                                        .finally(() => setLoading(false))
                                    }}
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                    {loading
                                        ?   <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                        :   <ArchiveRestore className="w-4 h-4 mr-1" />
                                    }
                                    Восстановить
                                </Button>
                        }
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>
                            Студентов: <br /><strong>{group.student_count}</strong> / {group.max_student_count}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span>Создатель: <br /><strong>{group.created_by.name}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
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