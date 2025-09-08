import { CreatedQuestion as CQ } from "@/types/interfaces"
import { Dispatch, FC, SetStateAction, useState } from "react"
import { archQuestion, unarchQuestion } from "@/services/api.service"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Archive, ArchiveRestore, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react"
import clsx from "clsx"

export const CreatedQuestion: FC<{question: CQ, fetchQuestions: () => void}> = ({question, fetchQuestions}) => {
    const [expanded, setExpanded] = useState(false)
    const [isArchiving, setIsArchiving] = useState(false)

    const handleArchive = () => {
        setIsArchiving(true);
        (question.is_active 
            ?   archQuestion(question.id) 
            :   unarchQuestion(question.id)
        )
            .then(() => fetchQuestions())
            .finally(() => setIsArchiving(false))
    }

    return (
        <article className={clsx(
            "rounded-lg p-4 m-4 shadow-sm border transition-all bg-background/60",
            !question.is_active && 'opacity-70 bg-muted/30',
            expanded && 'ring-2 ring-primary/20'
        )}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h4
                        className="text-md font-medium overflow-hidden cursor-pointer hover:text-primary transition-colors line-clamp-2"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {question.text}
                    </h4>
                    
                    <div className="flex items-center gap-4 text-sm mt-2">
                        <span className="bg-secondary px-2 py-1 rounded-md">
                            Тип: {question.question_type === 'text'
                                    ?   'Без вариантов'
                                    :   question.question_type === 'single' 
                                        ?   'Один ответ' 
                                        :   'Множественный выбор'
                                }
                        </span>
                        <Badge 
                            onClick={handleArchive} 
                            className="cursor-pointer flex items-center gap-1" 
                            variant={question.is_active ? "default" : "secondary"}
                        >
                            {question.is_active ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Активный
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-3.5 w-3.5" />
                                    В архиве
                                </>
                            )}
                        </Badge>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleArchive}
                    disabled={isArchiving}
                    title={question.is_active ? 'Архивировать' : 'Разархивировать'}
                    className="h-8 w-8 p-0"
                >
                    {isArchiving 
                        ?   <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        : question.is_active 
                            ?   <Archive className="h-4 w-4" />
                            :   <ArchiveRestore className="h-4 w-4" />
                    }
                </Button>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground p-0 h-6"
            >   
                <ChevronUp className={clsx("h-3.5 w-3.5 transition-all", expanded && 'rotate-180')} />
                {expanded ? 'Скрыть ответы' : 'Показать ответы'}
            </Button>

            {expanded && (
                <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                        Варианты ответов: {question.question_type === 'text' ? 'для первичной проверки' : ''}
                        <Badge variant="outline">
                            {question.answer_options.length}
                        </Badge>
                    </h5>
                    <ul className="space-y-2">
                        {question.answer_options.map(option => (
                            <li
                                key={option.id}
                                className={clsx(
                                    'p-2 flex rounded-sm font-medium border-l-[3px]', 
                                    'text-sm text-black content-center',
                                    option.is_correct ? 'bg-[#bfffbf] border-l-[#44ff4a]' : 'bg-[#ffb4b4] border-l-[#ff0000]'
                                )}
                            >
                                <span className="flex-1">{option.text}</span>
                                {option.is_correct ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </article>
    )
}