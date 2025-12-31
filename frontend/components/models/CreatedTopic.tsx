import { useState, useEffect, memo, FC } from "react"
import { useSearchParams } from "react-router-dom"
import { useTopicStore } from "@/stores/useTopicStore"
import { Button, Badge } from "@/components"
import { CreatedQuestion } from "@/components"
import { CreatedTopic as CT } from "@/types/interfaces"
import { archTopic, unarchTopic } from "@/services/topic"
import { getQuestions } from "@/services/question"
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
  Loader2,
  KeyRound
} from "lucide-react"
import { TopicDetailsDialog } from "../dialogs/topic-details-dialog"

export const CreatedTopic = memo(({ topic, index }: {
    topic: CT, 
    index: number,
}) => {
    const [params, setParams] = useSearchParams()
    const courseId = Number(params.get('course_id'))
    const fetchTopics = useTopicStore(s => s.fetchCreatedTopics)
    

    const handleArchTopic = () => {
        (topic.is_active 
            ? archTopic(topic.id)
            : unarchTopic(topic.id)
        ).then(() => {fetchTopics(courseId)})
    }



    return (
        <article className={clsx(
            `border border-foreground overflow-hidden transition-all duration-300`,
            'rounded-md shadow-sm mb-4 min-h-42 h-fit',
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
                        <span>Вопросов: {topic.question_count}</span>
                    </div>

                    <div className="flex items-center gap-1 text-sm bg-secondary/20 px-2 py-1 rounded-full">
                        <KeyRound className="h-3.5 w-3.5" />
                        Мин. {topic.score_for_pass} баллов
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

                <div className={clsx('mt-4 flex items-center gap-2 w-full sm:w-auto')} >
                    <TopicDetailsDialog topic={topic} />
                </div>
            </section>
        </article>
    )
})


