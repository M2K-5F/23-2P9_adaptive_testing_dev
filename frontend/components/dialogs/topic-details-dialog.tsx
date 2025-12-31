import { CreatedQuestion } from "../models/CreatedQuestion"
import { Archive, BookOpen, FileText, KeyRound, Loader2 } from "lucide-react"
import { CreateQuestionDialog } from "./create-question-dialog"
import { DialogHeader,  Dialog, DialogContent, DialogTitle, DialogTrigger  } from "../ui/dialog"
import { FC, useEffect, useState } from "react"
import { CreatedTopic as CT } from "@/types/interfaces"
import { getQuestions } from "@/services/question"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { useSearchParams } from "react-router-dom"

export const TopicDetailsDialog: FC<{
    topic: CT
}> = ({topic}) => {
    const [questions, setQuestions] = useState<any[]>([])
    const [params, setParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)

    const fetchQuestions = async (topic_id: number) => {
        setIsLoading(true)
        try {
            const questionsData = await getQuestions(topic_id)
            setQuestions(questionsData)
        } finally {
            setIsLoading(false)
        }
    }
    

    useEffect(() => {fetchQuestions(topic.id)}, [])


    const activeQuestionsCount = questions.filter(q => q.is_active).length
    const isExpanded = Number(params.get('expanded')) === topic.id

    return (
        <Dialog 
            open={isExpanded} 
            onOpenChange={(v) => {
                setParams(p => {
                    p.set('expanded', `${isExpanded ? '0' : topic.id}`) 
                    return p
                })
            }}>
            <DialogTrigger asChild>
                <Button 
                    onClick={() => setParams(p => {
                        p.set('expanded', `${topic.id}`)
                        return p
                    })}    
                >Подробнее</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {topic.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="space-y-4 pb-4 border-b">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {topic.description || "Описание отсутствует"}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Вопросов: {questions.length}
                                {activeQuestionsCount > 0 && 
                                    <span className="text-green-600 ml-1">({activeQuestionsCount} актив.)</span>
                                }
                            </Badge>

                            <Badge variant="secondary" className="flex items-center gap-1">
                                <KeyRound className="h-3 w-3" />
                                Мин. {topic.score_for_pass} баллов
                            </Badge>

                            <Badge 
                                variant={topic.is_active ? "default" : "secondary"}
                                className="flex items-center gap-1"
                            >
                                {topic.is_active 
                                    ?   <>
                                            <div className="h-2 w-2 rounded-full bg-background animate-pulse" />
                                            Активный
                                        </>
                                    :   <>
                                            <Archive className="h-3 w-3" />
                                            В архиве
                                        </>
                                }
                            </Badge>
                        </div>
                    </div>

                    <div className="py-4 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-md font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Вопросы темы
                            </h4>
                            <CreateQuestionDialog 
                                topic_id={topic.id}
                                createQuestionHandler={() => {
                                    fetchQuestions(topic.id)
                                }}
                            />
                        </div>

                        <section className="pt-2 h-120 overflow-y-scroll scrollbar-hidden">
                            {!isLoading
                                ?   questions?.length 
                                    ?   questions.map(question => 
                                            <CreatedQuestion
                                                key={question.id} 
                                                question={question} 
                                                fetchQuestions={() => {fetchQuestions(topic.id)}}
                                            /> 
                                        ) 
                                    :   <p className="text-sm text-muted-foreground">
                                            Нет созданных вопросов
                                        </p>
                                :   <div className="flex items-center gap-2 w-40 mx-auto text-sm text-muted-foreground mt-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Загрузка вопросов...
                                    </div>
                            }
                        </section>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}