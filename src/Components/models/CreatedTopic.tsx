import { useState, useEffect, memo } from "react"
import { useSearchParams } from "react-router-dom"
import { useTopicStore } from "@/stores/useTopicStore"
import { Button, Badge } from "@/Components"
import { CreatedQuestion, QuestionConstructor } from "@/Components"
import { CreatedTopic as CT } from "@/types/interfaces"
import { getQuestions, archTopic, unarchTopic } from "@/services/api.service"
import clsx from "clsx"
import { 
  Archive, 
  ArchiveRestore, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Plus, 
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"

export const CreatedTopic = memo(({ topic, index }: {
    topic: CT, 
    index: number,
}) => {
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const expandedTopic = Number(params.get('expanded'))
    const isExpanded = expandedTopic === topic.id
    const fetchTopics = useTopicStore(s => s.fetchCreatedTopics)
    const [questions, setQuestions] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const handleExpand = () => {
        setParams(p => {
            p.set('expanded', `${isExpanded ? '0': topic.id}`)
            return p
        })
    }

    const fetchQuestions = async () => {
        setIsLoading(true)
        try {
            const questionsData = await getQuestions(topic.id)
            setQuestions(questionsData)
        } finally {
            setIsLoading(false)
        }
    }

    const handleArchTopic = () => {
        (topic.is_active 
            ? archTopic(topic.id)
            : unarchTopic(topic.id)
        ).then(() => {fetchTopics(courseId)})
    }

    useEffect(() => {
        if (!isExpanded) {
            fetchQuestions()
        }
    }, [isExpanded])

    const activeQuestionsCount = questions.filter(q => q.is_active).length

    return (
        <article className={clsx(
            `border border-foreground overflow-hidden transition-all duration-300`,
            'rounded-md shadow-sm mb-4 min-h-42 h-fit',
            isExpanded && 'sm:col-span-2',
            !topic.is_active &&  'opacity-70'
        )}>
            <section className="p-5 bg-card">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg mt-1">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 
                                className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors line-clamp-2" 
                                onClick={handleExpand}
                            >
                                {topic.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {topic.description || "Описание отсутствует"}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant='outline'
                        size="sm"
                        onClick={handleArchTopic}
                        title={topic.is_active ? 'Архивировать' : 'Разархивировать'}
                        className="h-8 w-8 p-0"
                    >
                        {topic.is_active ? 
                            <Archive className="h-4 w-4" /> : 
                            <ArchiveRestore className="h-4 w-4" />
                        }
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-sm bg-secondary/20 px-2 py-1 rounded-full">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Вопросов: {questions.length}</span>
                        {activeQuestionsCount > 0 && (
                            <span className="text-green-600">({activeQuestionsCount} актив.)</span>
                        )}
                    </div>
                    
                    <Badge 
                        className="cursor-pointer flex items-center gap-1" 
                        onClick={handleArchTopic} 
                        variant={topic.is_active ? 'default' : 'secondary'}
                    >
                        {topic.is_active 
                            ?   <>
                                    <div className="h-2 w-2 rounded-full bg-background animate-pulse"></div>
                                    Активный
                                </>
                            :   <>
                                    <Archive className="h-3 w-3" />
                                    В архиве
                                </>
                        }
                    </Badge>
                </div>

                <Button
                    variant={"outline"}
                    size="sm"
                    onClick={handleExpand}
                    className="mt-4 flex items-center gap-2 w-full sm:w-auto"
                >   
                    <ChevronUp className={clsx("h-4 w-4 transition-all", isExpanded && 'rotate-180')} />
                    {isExpanded ? 'Свернуть тему' : 'Подробнее'
                    }
                </Button>
            </section>

            {isExpanded && 
                <section className="py-4 bg-muted/50">
                    <div className="px-5 mb-4">
                        <h4 className="text-md font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Вопросы темы
                        </h4>                        
                    </div>

                    <div className="space-y-3">
                        {questions?.length ? 
                            questions.map(question => 
                                <CreatedQuestion
                                    key={question.id} 
                                    question={question} 
                                    fetchQuestions={fetchQuestions}
                                /> 
                            ) : 
                            !isLoading && (
                                <p className="text-sm text-muted-foreground px-5">
                                    Нет созданных вопросов
                                </p>
                            )
                        }
                    </div>
                    {isLoading &&
                        <div className="flex items-center gap-2 w-40 mx-auto text-sm text-muted-foreground mt-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Загрузка вопросов...
                        </div>
                    }

                    {!isCreating 
                        ?   <div className="px-5 mt-4">
                                <Button 
                                    variant='default'
                                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                                    onClick={() => setIsCreating(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Создать вопрос
                                </Button>
                            </div>
                        :   <>
                                <QuestionConstructor
                                    topic_id={topic.id}
                                    createQuestionHandler={() => {
                                        setIsCreating(false)
                                        fetchQuestions()
                                    }}
                                />
                                
                                <div className="mt-3 px-5">
                                    <Button
                                        variant='destructive'
                                        size="sm"
                                        className="flex items-center gap-2" 
                                        onClick={() => setIsCreating(false)}
                                    >
                                        <X className="h-4 w-4" />
                                        Отменить создание
                                    </Button>
                                </div>
                            </>
                    }
                </section>
            }
        </article>
    )
})