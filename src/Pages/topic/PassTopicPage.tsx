import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Check, ChevronRight, Loader2, X } from 'lucide-react'
import { Button, Card, Progress, Badge, Separator, CardHeader, CardContent, CardFooter, Loader, Input } from '@/Components'
import { toast } from 'sonner'
import { CompletedTopic, QuestionToPass } from '@/types/interfaces'
import { useImmer } from 'use-immer'
import { startPassingTopic, submitTopic } from '@/services/api.service'
import { useTopicStore } from '@/stores/useTopicStore'


export const TopicPage = () => {
    const [searchParams] = useSearchParams()
    const userTopicId = Number(searchParams.get('utopic_id'))
    const title = searchParams.get('title')
    const navigate = useNavigate()
    const location = useLocation()
    const [questions, setQuestions] = useState<QuestionToPass[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useImmer<Record<number, number[]>>({})
    const [questionAnswersTexts, setAnswerTexts] = useImmer<Record<number, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => { 
        if (!(location.state && location.state.from === `${userTopicId}`)) {
            navigate('/')
        }

        (async () => {
            try {
                setQuestions( await startPassingTopic(userTopicId))
            } catch (error) {
                toast.error('Ошибка загрузки вопросов')
            } finally {
                setIsLoading(false)
            }
        })()
    }, [])

    const getAnswerText = (qid: number) => {
        const current = questionAnswersTexts[qid]
        if (typeof current === 'undefined') {
            setAnswerTexts(d => {
                d[qid] = ''
            })
        }
        return questionAnswersTexts[qid]
    }

    const handleAnswerSelect = (questionId: number, optionId: number, isMultiple: boolean) => {
        setSelectedAnswers(d => {
            if (isMultiple) {
                const current = d[questionId] || []
                d[questionId] =  
                    (current.includes(optionId)
                        ? current.filter(id => id !== optionId)
                        : [...current, optionId])
                
            } else {
                const current = d[questionId] || []
                d[questionId] = (current.includes(optionId) ? [] : [optionId])
            }
        })
    }
    
    const handleAnswerInput = (questionId: number, text: string) => {
        setAnswerTexts(d => {
            d[questionId] = text
        })
    }

    const handleSubmit = async () => {
        if (isSubmitting) return

        setIsSubmitting(true)
        try {
            const submissionData: CompletedTopic = {
                user_topic_id: userTopicId,
                questions: questions.map(q => {
                    if (q.question_type !== 'text') {
                        return {
                            id: q.id,
                            by_topic: q.by_topic.id,
                            answer_options: q.answer_options.map(opt => ({
                                id: opt.id,
                                is_correct: (selectedAnswers[q.id] || []).includes(opt.id)
                            })),
                            type:'choice'
                        }
                    } else {
                        return {
                            id: q.id,
                            by_topic: q.by_topic.id,
                            text: questionAnswersTexts[q.id],
                            type:'text'
                        }
                    }
                })
            }
            

            await submitTopic(submissionData)
            
            await toast.success('Ответы успешно отправлены!')
            navigate(-1) 
        } catch (error) {
            toast.error('Ошибка отправки ответов')
        } finally {
            setIsSubmitting(false)
        }
    }

    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100
    const is_disabled = questions.length > 0 && !(selectedAnswers[currentQuestion?.id]?.length || questionAnswersTexts[currentQuestion.id]?.length)
    

    if (isLoading) {
        return (
        <div className="flex justify-center items-center h-dvh w-full">
            <Loader variant='success' />
        </div>
        )
    }
    
    return (
        <div className="p-4 flex justify-center w-full h-dvh items-center ">
            <Card className="max-w-3xl mb-16 grow">
                <CardHeader className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">{title ?? 'Прохождение темы'}</h2>
                        <Badge variant="outline">
                            Вопрос {currentQuestionIndex + 1} из {questions.length}
                        </Badge>
                    </div>
                
                    <Progress offsetValue={1} value={progress} className="h-2" />
                </CardHeader>

                {currentQuestion && 
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
                            
                            <Separator />
                        
                            {currentQuestion.question_type !== 'text' &&
                                <div className="space-y-3">
                                    {currentQuestion.answer_options.map(option => (
                                    <Button
                                        key={option.id}
                                        variant={
                                        (selectedAnswers[currentQuestion.id] || []).includes(option.id)
                                            ? 'default'
                                            : 'outline'
                                        }
                                        className="w-full justify-start text-left h-auto py-3"
                                        onClick={() => handleAnswerSelect(
                                            currentQuestion.id, 
                                            option.id, 
                                            currentQuestion.question_type === 'multiple'
                                        )}
                                    >
                                        {currentQuestion.question_type === 'multiple' 
                                            ?   <div className="mr-2 h-5 w-5 rounded border flex items-center justify-center">
                                                    {(selectedAnswers[currentQuestion.id] || []).includes(option.id) && (
                                                    <Check className="h-4 w-4" />
                                                    )}
                                                </div>
                                            :   <div className="mr-2 h-5 w-5 rounded-full border flex items-center justify-center">
                                                    {(selectedAnswers[currentQuestion.id] || []).includes(option.id) && (
                                                    <div className="h-3 w-3 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                        }
                                        {option.text}
                                    </Button>
                                    ))}
                                </div>
                            }
                            {currentQuestion.question_type === 'text' &&
                                <Input  
                                    placeholder='ответ на вопрос'
                                    value={getAnswerText(currentQuestion.id)} 
                                    onChange={(event) => {
                                        const value = event.currentTarget.value
                                        handleAnswerInput(currentQuestion.id, value)
                                    }}
                                />
                            }
                        </div>
                    </CardContent>
                }

                <CardFooter className="p-4 flex justify-between">
                    <Button 
                        variant="outline" 
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    >
                        Назад
                    </Button>
                
                    {currentQuestionIndex < questions.length - 1 
                        ?   <Button 
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                disabled={is_disabled}
                                >
                                Следующий вопрос <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        :   <Button 
                                onClick={handleSubmit}
                                disabled={is_disabled || isSubmitting}
                                >
                                {isSubmitting &&
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                }
                                Завершить тему
                            </Button>
                    }
                </CardFooter>
            </Card>
        </div>
    )
}