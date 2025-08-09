import { CreatedQuestion as CQ } from "@/types/interfaces"
import { Dispatch, FC, SetStateAction, useState } from "react"
import { archQuestion } from "@/services/api.service"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"

export const CreatedQuestion: FC<{question: CQ, fetchQuestions: () => void}> = ({question, fetchQuestions}) => {
    const [expanded, setExpanded] = useState(false)

    const handleArchive = () => {
        archQuestion(question.id).then(() => fetchQuestions())
    }

    return (
        <article className={` rounded-lg p-4 mb-4 shadow-sm border transition-all ${!question.is_active ? 'opacity-70' : ''}`}>
            <div className="flex justify-between items-start mb-3">
                <h4
                    className="text-md max-w-3/4 font-medium overflow-hidden cursor-pointer hover:text-primary"
                    onClick={() => setExpanded(!expanded)}
                >
                    {question.text}
                </h4>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleArchive}
                    title={question.is_active ? 'Архивировать' : 'Разархивировать'}
                >
                    {question.is_active ? '🗄️' : '📦'}
                </Button>
            </div>

            <div className="flex items-center gap-4 text-sm mb-3">
                <span>Тип: {question.question_type === 'single' ? 'Один ответ' : 'Множественный выбор'}</span>
                <Badge onClick={handleArchive} className="cursor-pointer" variant={question.is_active ? "default" : "secondary"}>
                    {question.is_active ? 'Активный' : 'В архиве'}
                </Badge>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">Варианты ответов:</h5>
                    {question.answer_options.length > 0 ? (
                        <ul className="space-y-2">
                            {question.answer_options.map(option => (
                                <li
                                    key={option.id}
                                    className={`p-1 rounded-sm font-medium text-sm text-black content-center ${option.is_correct ? 'bg-[#bfffbf] border-l-[3px] border-l-[#44ff4a]' : 'bg-[#ffb4b4] border-l-[3px] border-l-[#ff0000]'}`}
                                >
                                    {option.text}
                                    {option.is_correct && (
                                        <span className="ml-2 text-green-600">✔</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Нет вариантов ответа</p>
                    )}
                </div>
            )}
        </article>
    )
}