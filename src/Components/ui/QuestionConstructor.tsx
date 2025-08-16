import { memo, ChangeEvent, FC } from "react"
import { Answer, Question } from "../../types/interfaces"
import { Updater, useImmer } from "use-immer"
import { createQuestion } from "../../services/api.service"
import { toast } from "sonner"
import { Button } from '@/Components/ui/button'
import { Input } from "@/Components/ui/input"
import { Checkbox } from "@/Components/ui/checkbox"
import { Label } from "@/Components/ui/label"

export const QuestionConstructor:FC<{createQuestionHandler: () => void, topic_id: number, }> = memo((props) => {
    const [createdQuestion, setCreatedQuestion] = useImmer<Question>({
        text: '',
        question_type: 'single',
        answer_options: [{
            id: 0,
            text: '',
            is_correct: true
        }]
    })

    const createQuestionFromDraft = () => {
        const question = createdQuestion
        let description: string | undefined
        const correctAnswersCount = question.answer_options.filter(answer => answer.is_correct).length

        if (!question.text ) {
            description = 'Введите текст вопроса'
        }
        else if (!question.answer_options.length) {
            description = 'Как тебе удалось удалить первый вариант ответа!?'
        }
        else if (question.answer_options.filter(answer => answer.text).length !== question.answer_options.length) {
            description = 'Вы заполнили не все поля с ответами'
        }
        else if (correctAnswersCount === 0) {
            description = 'Выберите хотя бы один верный вариант ответа'
        }
        else if (correctAnswersCount === question.answer_options.length) {
            description = 'Верными не могут быть все ответы'
        }

        if (description) {
            toast('Ошибка при создании вопроса:', {description: description})
            return
        }

        const toCreate: Question = {
            text: question.text, 
            question_type: question.question_type, 
            answer_options: question.answer_options.map(answer => ({
                text: answer.text, is_correct: answer.is_correct
            }))
        }

        createQuestion(props.topic_id, toCreate)
        .then(() => {
            toast('Вопрос в теме успешно создан!')
            props.createQuestionHandler()
        })
        .catch((error: Error) => {
            switch (error.message) {
                case '404': 
                    toast('Ошибка')
                    break

                case '400':
                    toast('Вопрос с таким текстом уже создан в этой теме!')
                    break
            }
        })
        
    }

    return (
        <article className="p-4 w-auto shadow-md mb-6 border-b border-t  border-gray-200">
            <Label className="text-md w-full justify-center content-center mb-3">Создание вопроса:</Label>
            <Input
                placeholder="Текст вопроса"
                className="max-w-100 w-full mb-4 h-10  overflow-ellipsis focus-visible:ring-2 focus-visible:ring-offset-2 border-gray-300"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setCreatedQuestion(draft => { draft.text = e.target.value })
                }}
                value={createdQuestion.text}
            />

            <h5 className="text-md border-b-2 w-fit mb-2">
                Тип: {createdQuestion.question_type === 'single' ? "Один ответ" : "Несколько ответов"}
            </h5>

            <fieldset className="mb-4">
                <h5 className="text-md font-medium mb-3">Варианты ответов:</h5>
                {createdQuestion.answer_options.map((answer, index) => (
                    <AnswerElement
                        key={index}
                        index={index}
                        answer={answer}
                        questionSetter={setCreatedQuestion}
                    />
                ))}
            </fieldset>

            <div className="flex flex-wrap gap-3">
                <Button
                    onClick={() => {
                        setCreatedQuestion(draft => {
                            draft.answer_options.push({
                                id: draft.answer_options.length,
                                text: '',
                                is_correct: false
                            })
                        })
                    }}
                    className="hover:bg-green-300"
                >
                    + Добавить вариант ответа
                </Button>

                <Button className="bg-green-500 hover:bg-green-400" onClick={createQuestionFromDraft}>
                    ✔ Создать вопрос
                </Button>
            </div>
        </article>
    )
})

const AnswerElement = memo((props: {
    answer: Answer
    questionSetter: Updater<Question>
    index: number
}) => {
    return (
        <article className="relative border border-dashed border-gray-400 rounded-lg mb-4 p-4 max-w-100 w-full">
            {Boolean(props.index) && (
                <Button
                    onClick={() => {
                        props.questionSetter(draft => {
                            draft.answer_options = draft.answer_options.filter((_, i) => i !== props.index)
                        })
                    }}
                    variant={'outline'}
                    className="absolute w-8 h-8 right-3 top-2  text-sm px-2 py-1"
                >
                    🗑️
                </Button>
            )}

            <header className="mb-2">
                <Label className="font-medium">{`Вариант №${props.index + 1}:`}</Label>
            </header>

            <div className="flex w-full items-center gap-3">
                <Input
                    placeholder="введите текст ответа"
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

                <Checkbox
                    className="h-5 w-5"
                    checked={props.answer.is_correct}
                    onCheckedChange={(checked) => {
                        props.questionSetter(draft => {
                            if (!(draft.answer_options.filter(a => a.is_correct).length === 1 && !checked)) {
                                draft.answer_options[props.index].is_correct = !!checked
                            }
                            const correctAnswers = draft.answer_options.filter(a => a.is_correct).length
                            draft.question_type = correctAnswers > 1 ? 'multiple' : 'single'
                        })
                    }}
                />
            </div>
        </article>
    )
})