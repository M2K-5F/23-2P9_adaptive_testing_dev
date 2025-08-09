import { useState, useEffect, memo } from "react"
import { useSearchParams } from "react-router-dom"
import { useTopicStore } from "@/stores/useTopicStore"
import { Button, Badge, CreatedQuestion, QuestionConstructor } from "@/Components/ui"
import { CreatedTopic as CT, CreatedQuestion as CQ } from "@/types/interfaces"
import { getQuestions, archTopic } from "@/services/api.service"
import clsx from "clsx"

export const CreatedTopic = memo(({ topic, index }: {
    topic: CT, 
    index: number,
}) => {
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const expandedTopic = Number(params.get('expanded'))
    const isExpanded = expandedTopic === topic.id
    const fetchTopics = useTopicStore(s => s.fetchTopics)
    const [questions, setQuestions] = useState<CQ[]>([])
    const [isCreating, setIsCreating] = useState(false)
    
    const handleExpand = () => {
        setParams(p => {
            p.set('expanded', `${isExpanded ? '0': topic.id}`)
            return p
        })
    }

    const fetchQuestions = async () => {
        setQuestions(await getQuestions(topic.id))
    }

    const handleArchTopic = (topicId: number) => {
        archTopic(topic.id)
        .then(() => {fetchTopics(courseId)})
    }

    useEffect(() => {fetchQuestions()}, [])


    return (
        <article className={clsx(
            `border border-foreground overflow-hidden`,
            'rounded-lg shadow-sm mb-4',
            isExpanded && 'sm:col-span-2',
            !topic.is_active &&  'opacity-70'
        )}>
            <section className="p-4 bg-muted">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium cursor-pointer" onClick={handleExpand}>
                        {topic.title}
                    </h3>

                    <Button
                        variant='outline'
                        size="sm"
                        onClick={() => {handleArchTopic(topic.id)}}
                        title={topic.is_active ? 'Архивировать' : 'Разархивировать'}
                    >
                        {topic.is_active ? '🗄️' : '📦'}
                    </Button>
                </div>

                <p className="text-sm text-wrap text-muted-foreground wrap-break-word mb-2">
                    {topic.description || "Нет описания"}
                </p>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">Статус:</span>
                    <Badge 
                        className="cursor-pointer" 
                        onClick={() => handleArchTopic(topic.id)} 
                        variant={topic.is_active ? 'default' : 'outline'}
                        >{
                            topic.is_active ? 'Активный' : 'В архиве'
                        }</Badge>
                </div>

                <Button
                    variant={isExpanded ? "destructive" : "default"}
                    size="sm"
                    onClick={handleExpand}
                >
                    {isExpanded ? 'Закрыть тему' : 'Перейти к теме'}
                </Button>
            </section>

            {isExpanded && 
                <section className="border-t p-4 bg-muted/50">
                    <h4 className="text-md font-medium mb-3">Вопросы темы:</h4>

                    {questions?.length ? 
                            questions.map(question => 
                                <CreatedQuestion
                                    key={question.id} 
                                    question={question} 
                                    fetchQuestions={fetchQuestions}
                                /> 
                            ) : 
                            <p className="text-sm text-muted-foreground m-2.5">Нет созданных вопросов</p>
                    
                    }

                    {!isCreating ? (
                        <Button 
                            variant='default'
                            className="mt-3 ml-2 h-9 bg-green-400 hover:bg-green-300"
                            onClick={() => setIsCreating(true)}
                        >
                            + Создать вопрос
                        </Button>
                    ) : (
                        <>
                            <QuestionConstructor
                                topic_id={topic.id}
                                createQuestionHandler={() => {setIsCreating(false), fetchQuestions()}}
                            />
                            
                            <div className="mt-3">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsCreating(false)}
                                >
                                    Отменить создание
                                </Button>
                            </div>
                        </>
                    )}
                </section>
            }
        </article>
    )
})