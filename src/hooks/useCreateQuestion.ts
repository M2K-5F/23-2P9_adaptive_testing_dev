import { createQuestion } from "@/services/api.service"
import { Question } from "@/types/interfaces"
import { toast } from "sonner"

export const useCreateQuestion = () => (question: Question, topicId: number, onResolve: () => void, onReject: () => void) => {
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
            onReject()
            return
        }

        const toCreate: Question = {
            text: question.text, 
            question_type: question.question_type, 
            answer_options: question.answer_options.map(answer => ({
                text: answer.text, is_correct: answer.is_correct
            }))
        }

        createQuestion(topicId, toCreate)
        .then(() => {
            onResolve()
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