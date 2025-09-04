import React, { FC, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/Components/';
import { CheckCircle2, XCircle, MinusCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { UnsubmitedAnswer } from '@/types/interfaces';
import clsx from 'clsx';
import { useImmer } from 'use-immer';
import { submitQuestion } from '@/services/api.service';
import { toast } from 'sonner';

type EvaluationType = 'correct' | 'partial' | 'incorrect';

export const SubmitTextQuestionsDialog: FC<{answers: UnsubmitedAnswer[], onSuccess: () => void}> = ({answers, onSuccess}) => {
    const [open, setOpen] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [scores, setScores] = useImmer<Record<number, {score: number}>>({})

    const currentAnswer = answers[currentIndex]

    const handleEvaluation = (type: EvaluationType) => {
        let score = 0;

        switch (type) {
            case 'correct':
                score = 1
                break
            case 'partial':
                score = 0.5
                break
            case 'incorrect':
                score = 0
                break
        }

        setScores(d => {
            d[currentAnswer.id] = {score: score}
        })

        if (currentIndex < answers.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handleSubmit = () => {
        try {
            answers.forEach( async (answer) => {
                await submitQuestion(answer.id, scores[answer.id].score)
            })
            toast.success('Результаты ответов сохранены')
            onSuccess()
        } catch {
            toast.error('Не удалось сохранить результаты')
        }

    }


    if (!currentAnswer) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="link" size="sm" className={clsx('text-sm font-light')} >
                    <FileText className="h-4 w-4" />
                    Проверить ответы
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Проверка ответов студента</DialogTitle>
                    <DialogDescription>
                        {`Студент: ${currentAnswer.user.name}`}
                    </DialogDescription>
                </DialogHeader>

                <Card className="p-4">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                                Вопрос:
                            </Label>
                            <Card className="p-3 mt-1 bg-muted/50">
                                <p className="text-sm">{currentAnswer.question.text}</p>
                            </Card>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                                Ответ студента:
                            </Label>
                            <Card className="p-3 mt-1">
                                <p className="text-sm whitespace-pre-wrap">{currentAnswer.text}</p>
                            </Card>
                        </div>

                        <div className="text-center">
                            <Badge variant="outline">
                                Выставленная оценка: 
                                {scores[currentAnswer.id] 
                                    ?   ` ${scores[currentAnswer.id].score}`
                                    :   ' не выставлена'
                                }
                            </Badge>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-row-reverse justify-around gap-3">
                    <Button
                        size="lg"
                        onClick={() => handleEvaluation('correct')}
                        className="gap-2 bg-green-300"
                    >
                        <CheckCircle2 className="h-5 w-5" />
                        Правильно
                    </Button>

                    <Button
                        size="lg"
                        onClick={() => handleEvaluation('partial')}
                        className="gap-2 bg-orange-300"
                    >
                        <MinusCircle className="h-5 w-5" />
                        Частично
                    </Button>

                    <Button
                        size="lg"
                        onClick={() => handleEvaluation('incorrect')}
                        className="gap-2 bg-red-300"
                    >
                        <XCircle className="h-5 w-5" />
                        Неправильно
                    </Button>
                </div>

                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={() => {
                            currentIndex > 0 && setCurrentIndex(p => p-1)
                        }}
                        disabled={currentIndex === 0}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                    </Button>

                    <div className="text-sm text-muted-foreground">
                        Ответ {currentIndex + 1} из {answers.length}
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => {
                            currentIndex < answers.length - 1 && setCurrentIndex(p => p + 1)
                        }}
                        disabled={currentIndex === answers.length - 1 || !scores[currentAnswer.id]}
                        className="gap-1"
                    >
                        Вперед
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex justify-end pt-2">
                    <Button 
                        onClick={handleSubmit}
                        disabled={currentIndex + 1 < answers.length || !scores[currentAnswer.id]}
                        className="min-w-32"
                    >
                        {'Завершить проверку'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}