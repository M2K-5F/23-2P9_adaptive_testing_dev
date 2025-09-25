import React, { memo, ChangeEvent, FC, useState, useEffect, Profiler } from "react"
import { AnswerCreate, QuestionCreate, TextAnswerCreate } from "../../types/interfaces"
import { Updater, useImmer } from "use-immer"
import { Button } from '@/Components/ui/button'
import { Input } from "@/Components/ui/input"
import { Checkbox } from "@/Components/ui/checkbox"
import { Badge, Label, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components"
import { useCreateQuestion } from "@/hooks/useCreateQuestion"
import { toast } from "sonner"
import { Plus, X, Trash2, CheckCircle, AlertCircle, FileText, FilePlus } from "lucide-react"
import clsx from "clsx"


export const QuestionConstructor:FC<{createQuestionHandler: () => void, topic_id: number}> = memo((props) => {
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const handler = useCreateQuestion()
    const [questionType, setType] = useState<'text' | 'choice'>('choice')
    const [createdQuestion, setCreatedQuestion] = useImmer<QuestionCreate>({
        text: '',
        answer_options: [{
            text: '',
            is_correct: false
        }]
    })
    

    const correctAnswersCount = createdQuestion.answer_options.filter(opt => opt.is_correct).length

    useEffect(() => {
        if (isCreating) {        
            console.log(createdQuestion);
                
            handler({...createdQuestion, question_type: questionType}, props.topic_id, 
                () => {
                    toast.success('Вопрос успешно создан!')
                    props.createQuestionHandler()
                }, 
                () => {
                    setIsCreating(false)
                })
        }
    }, [isCreating])

    return (
        <article className="p-3 pt-5 w-auto shadow-md bg-input/80 my-6 rounded-lg border border-foreground">
            <div className="flex items-center gap-2 mb-4">
                <FilePlus className="h-5 w-5 text-primary" />
                <Label className="text-md font-semibold">Создание нового вопроса</Label>
            </div>
            
            <Input
                placeholder="Введите текст вопроса"
                className="w-full mb-4 h-10 focus-visible:ring-2 focus-visible:ring-primary border-border"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCreatedQuestion(draft => { draft.text = e.target.value })
                }}
                value={createdQuestion.text}
            />

            <Select 
                value={questionType} 
                onValueChange={(v: 'choice'|'text') => {
                    setType(v)
                }}
            >
                <SelectTrigger className={clsx('bg-white mb-4')} >
                    <SelectValue placeholder='Тип вопроса' />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>
                            Типы
                        </SelectLabel>
                        <SelectItem value="choice">С вариантами ответов</SelectItem>
                        <SelectItem value="text">Без вариантов ответа</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <div className="flex items-center gap-3 mb-4 p-3 bg-secondary/20 rounded-lg">
                <Badge variant='default'>
                    {questionType === 'choice'
                        ?   "Выбор из вариантов"
                        :   "Ручной ввод ответа"
                    }
                </Badge>
            </div>

            {questionType === 'choice' &&
                <fieldset className="mb-4">
                    <legend className="text-md font-medium mb-3 flex items-center gap-2">
                        Варианты ответов
                        <Badge variant="outline">
                            {createdQuestion.answer_options.length}
                        </Badge>
                    </legend>
                    
                    <div className="space-y-3">
                        {createdQuestion.answer_options.map((answer, index) => (
                            <AnswerElement
                                key={index}
                                index={index}
                                answer={answer}
                                questionSetter={setCreatedQuestion}
                            />
                        ))}
                    </div>
                </fieldset>
            }

            {questionType === 'text' &&
                <fieldset className="mb-4">
                    <legend className="text-md font-medium mb-3 flex items-center gap-2">
                        Варианты ответов для первичной проверки
                        <Badge variant="outline">
                            {createdQuestion.answer_options.length}
                        </Badge>
                    </legend>
                    
                    <div className="space-y-3">
                        {createdQuestion.answer_options.map((answer, index) => (
                            <TextAnswerElement
                                key={index}
                                index={index}
                                answer={answer}
                                questionSetter={setCreatedQuestion}
                            />
                        ))}
                    </div>
                </fieldset>
            }

            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={() => {
                        setCreatedQuestion(draft => {
                            draft.answer_options.push({
                                text: '',
                                is_correct: false
                            })
                        })
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Добавить вариант
                </Button>

                <Button 
                    disabled={isCreating} 
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600" 
                    onClick={() => setIsCreating(true)}
                >
                    {isCreating 
                        ?   <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        :   <CheckCircle className="h-4 w-4" />
                    }
                    Создать вопрос
                </Button>
            </div>
        </article>
    )
})


const AnswerElement = memo((props: {
    answer: AnswerCreate
    questionSetter: Updater<QuestionCreate>
    index: number
}) => {
    return (
        <article className="relative border border-dashed border-border rounded-lg p-4 bg-background/60 transition-all hover:border-primary/50">
            {props.index > 0 && (
                <Button
                    onClick={() => {
                        props.questionSetter(draft => {
                            draft.answer_options = draft.answer_options.filter((_, i) => i !== props.index)
                        })
                    }}
                    variant={'outline'}
                    size="sm"
                    className="absolute right-3 top-3 h-7 w-7 p-0"
                    title="Удалить вариант"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            )}

            <header className="mb-3">
                <Label className="font-medium flex items-center h-5.5 gap-2">
                    <span>Вариант ответа #{props.index + 1}</span>
                </Label>
            </header>

            <div className="flex w-full pr-5 items-center gap-3">
                <Input
                    placeholder="Введите текст ответа"
                    maxLength={115}
                    minLength={3}
                    className="flex-1"
                    value={props.answer.text}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        props.questionSetter(draft => {
                            draft.answer_options[props.index].text = e.target.value
                        })
                    }}
                />

                <div className="flex items-center gap-2">
                    <Checkbox
                        className="h-5 w-5"
                        checked={props.answer.is_correct}
                        onCheckedChange={(checked) => {
                            props.questionSetter(draft => {
                                if (!(draft.answer_options.filter(a => a.is_correct).length === 1 && !checked)) {
                                    draft.answer_options[props.index].is_correct = !!checked
                                }
                            })
                        }}
                    />
                    <Label 
                        className="text-sm w-15"
                    >{props.answer.is_correct 
                        ?   'Верный'
                        :   'Ложный'
                    }
                    </Label>
                </div>
            </div>
        </article>
    )
})


const TextAnswerElement: FC<{
    answer: TextAnswerCreate,
    questionSetter: Updater<QuestionCreate>,
    index: number
}> = memo(({answer, questionSetter, index}) => {  
    return (
        <article className="relative border border-dashed border-border rounded-lg p-4 bg-background/60 transition-all hover:border-primary/50">
            <header className="mb-3">
                <Label className="font-medium flex items-center h-5.5 gap-2">
                    <span>Возможный вариант ответа #{index + 1}</span>
                </Label>
            </header>

            <div className="flex w-full items-center gap-3">
                <Input
                    placeholder="Введите текст ответа"
                    maxLength={115}
                    minLength={3}
                    className="flex-1"
                    value={answer.text}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        questionSetter(draft => {
                            draft.answer_options[index].text = e.target.value
                        })
                    }}
                />
            </div>
        </article>
    )
})