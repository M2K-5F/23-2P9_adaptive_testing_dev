import React, { memo, ChangeEvent, FC, useState, useEffect, Profiler } from "react"
import { AnswerCreate, QuestionCreate, TextAnswerCreate } from "../../types/interfaces"
import { Updater, useImmer } from "use-immer"
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge, Dialog, DialogContent, DialogTrigger, Label, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components"
import { useCreateQuestion } from "@/hooks/useCreateQuestion"
import { toast } from "sonner"
import { Plus, X, Trash2, CheckCircle, AlertCircle, FileText, FilePlus } from "lucide-react"
import clsx from "clsx"


export const CreateQuestionDialog: FC<{
    createQuestionHandler: () => void, 
    topic_id: number
}> = memo((props) => {
    const [isCreating, setIsCreating] = useState<boolean>(false)
    const [isOpen, setOpen] = useState<boolean>(false)
    const handler = useCreateQuestion()
    const [question, setQuestion] = useImmer<QuestionCreate>({
        text: '',
        question_type: 'choice',
        answer_options: [{
            text: '',
            is_correct: false
        }],
        base_weight_profile: 'Balanced'
    })

    useEffect(() => {
        isCreating && handler(
            question, 
            props.topic_id, 
            () => {
                toast.success('Вопрос успешно создан!')
                setOpen(false)
                props.createQuestionHandler()
                setIsCreating(false)
            }, 
            () => {
                setIsCreating(false)
            }
        )
    }, [isCreating])

    return(
        <Dialog open={isOpen}  onOpenChange={v => setOpen(v)}>    
            <DialogTrigger asChild>
                <Button 
                    variant='default'
                    size="sm"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                    onClick={() => setOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                    Создать вопрос
                </Button>
            </DialogTrigger>
            <DialogContent className="w-150 max-w-dvw p-4 shadow-md my-6 rounded-lg border border-foreground">
                <div className="flex items-center gap-2 mb-4">
                    <FilePlus className="h-5 w-5 text-primary" />
                    <Label className="text-md font-semibold">Создание нового вопроса</Label>
                </div>
        
                <Input
                    placeholder="Введите текст вопроса"
                    className="w-full mb-4 h-10 focus-visible:ring-2 focus-visible:ring-primary border-border"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setQuestion(draft => { draft.text = e.target.value })
                    }}
                    value={question.text}
                />

                <div className={clsx('grid grid-cols-2')} >
                    <div className="grid gap-2">
                        <Label>Тип вопроса:</Label>
                        <Select
                            value={question.question_type}
                            onValueChange={(v: 'choice'|'text') => {
                                setQuestion(d => {
                                    d.question_type = v
                                })
                            }}
                        >
                            <SelectTrigger id="type" className={clsx('bg-white mb-4')} >
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
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Профиль весов вопроса:</Label>
                        <Select
                            value={question.base_weight_profile}
                            onValueChange={(v: 'Aggressive' | 'Balanced' | 'Gentle') => {
                                setQuestion(d => {
                                    d.base_weight_profile = v
                                })
                            }}
                        >
                            <SelectTrigger  id="profile" className={clsx('bg-white mb-4')} >
                                <SelectValue placeholder='Тип вопроса' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>
                                        Профиль
                                    </SelectLabel>
                                    <SelectItem value="Aggressive">Быстрая адаптация</SelectItem>
                                    <SelectItem value="Balanced">Сбалансированный</SelectItem>
                                    <SelectItem value="Gentle">Медленная адаптация</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4 p-3 bg-secondary/20 rounded-lg">
                    <Badge variant='default'>
                        {question.question_type === 'choice'
                            ?   "Выбор из вариантов"
                            :   "Ручной ввод ответа"
                        }
                    </Badge>
                </div>
                <fieldset className="mb-4">
                    <legend className="text-md font-medium mb-3 flex items-center gap-2">
                        {question.question_type === 'choice' 
                            ?   'Варианты ответов'
                            :   'Варианты ответов для первичной проверки'
                        }
                        <Badge variant="outline">
                            {question.answer_options.length}
                        </Badge>
                    </legend>
    
                    <div className="space-y-3 max-h-80 overflow-y-scroll scrollbar-hidden">
                        {question.answer_options.map((answer, index) => (
                            question.question_type === 'choice'
                                ?   <AnswerElement
                                        key={index}
                                        index={index}
                                        answer={answer}
                                        questionSetter={setQuestion}
                                    />
                                :   <TextAnswerElement
                                        key={index}
                                        index={index}
                                        answer={answer}
                                        questionSetter={setQuestion}
                                    />
                        ))}
                    </div>
                </fieldset>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={() => {
                            setQuestion(draft => {
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
            </DialogContent>
        </Dialog>
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