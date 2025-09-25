// Components/dialogs/question-weights-dialog.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { QuestionWeight } from '@/types/interfaces';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Hash,
  Calendar
} from 'lucide-react';
import { getGroupWeights } from '@/services/group';
import { Loader } from '../other/Loader';


export const QuestionWeightsDialog: FC<{groupId: number}> = ({groupId}) => {
    const [weights, setWeights] = useState<QuestionWeight[]>([])
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isOpen, setOpen] = useState<boolean>(false)

    const fetchWeights = async (groupId: number) => {
        setLoading(true)
        try {
            setWeights(await getGroupWeights(groupId))
        }
        finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        isOpen && fetchWeights(groupId)
    }, [groupId, isOpen])


    return (
        <Dialog open={isOpen} onOpenChange={v => setOpen(v)}>
            <DialogTrigger onClick={e => e.stopPropagation()} asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Веса
                </Button>
            </DialogTrigger>
            
            <DialogContent onClick={e => e.stopPropagation()} className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Статистика весов вопросов
                    </DialogTitle>
                    <DialogDescription>
                        Текущие веса вопросов и их адаптивные параметры для группы "{weights[0]?.group.title}"
                    </DialogDescription>
                </DialogHeader>

                

                {weights.length > 0 && !isLoading 
                    ?   <>
                            <div className="flex-1 pr-4 overflow-y-scroll scrollbar-hidden">
                                <div className="space-y-4">
                                    {weights.map((weight) => (
                                        <QuestionWeightCard weight={weight} />
                                    ))}
                                </div>
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-lg">{weights.length}</div>
                                        <div className="text-muted-foreground">Всего вопросов</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="font-bold text-lg">
                                            {(weights.reduce((sum, w) => sum + w.weight, 0) / weights.length).toFixed(2)}
                                        </div>
                                        <div className="text-muted-foreground">Средний вес</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="font-bold text-lg">
                                            {weights.filter(w => w.question.is_active).length}
                                        </div>
                                        <div className="text-muted-foreground">Активных</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="font-bold text-lg">{weights[0].group.student_count}</div>
                                        <div className="text-muted-foreground">Студентов в группе</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    :   <Loader variant='success' />
                }
            </DialogContent>
        </Dialog>
    )
}


const QuestionWeightCard: FC<{weight: QuestionWeight}> = ({weight}) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
        })
    }

    const getWeightPercentage = (weight: number, min: number, max: number) => {
        return ((weight - min) / (max - min)) * 100
    }

    const getWeightVariant = (weight: number, min: number, max: number) => {
        const percentage = getWeightPercentage(weight, min, max)
        if (percentage < 33) return 'destructive'
        if (percentage < 66) return 'default'
        return 'default'
    }

    const getQuestionTypeIcon = (type: string) => {
        switch (type) {
        case 'text': return '📝'
        case 'single': return '🔘'
        case 'multiple': return '☑️'
        default: return '❓'
        }
    }


    return(
        <div key={weight.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getQuestionTypeIcon(weight.question.question_type)}</span>
                        <h4 className="font-semibold text-sm leading-tight">
                        {weight.question.text}
                        </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <span>ID: {weight.question.id}</span>
                        <Badge variant="outline" className="text-xs">
                        {weight.question.question_type}
                        </Badge>
                        <Badge 
                        variant={weight.question.is_active ? "default" : "destructive"} 
                        className="text-xs"
                        >
                        {weight.question.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                        {weight.weight.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        текущий вес
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Минимум: {weight.min_weight}</span>
                    <span>Максимум: {weight.max_weight}</span>
                </div>
                <Progress 
                    value={getWeightPercentage(weight.weight, weight.min_weight, weight.max_weight)}
                    className="h-2"
                    offsetValue={0}
                />
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Диапазон веса</span>
                    <Badge variant={getWeightVariant(weight.weight, weight.min_weight, weight.max_weight)}>
                        {getWeightPercentage(weight.weight, weight.min_weight, weight.max_weight).toFixed(1)}%
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-blue-500" />
                    <span className="font-medium">Шаг:</span>
                    <span>{weight.step}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="font-medium">Макс:</span>
                    <span>{weight.max_weight}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-red-500" />
                    <span className="font-medium">Мин:</span>
                    <span>{weight.min_weight}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-purple-500" />
                    <span className="font-medium">Создан:</span>
                    <span>{formatDate(weight.created_at)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Сложность вопроса:</span>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                        weight.weight > weight.max_weight * 0.7 ? 'bg-red-500' :
                        weight.weight > weight.max_weight * 0.45 ? 'bg-yellow-500' :
                        'bg-green-500'
                    }`} />

                    <span className="font-medium">
                        {weight.weight > weight.max_weight * 0.7 ? 'Сложный' :
                        weight.weight > weight.max_weight * 0.45 ? 'Средний' :
                        'Легкий'}
                    </span>
                </div>
            </div>
        </div>
    )
}