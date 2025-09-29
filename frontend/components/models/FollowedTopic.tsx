import { CreatedTopic, UserTopic } from "@/types/interfaces";
import { Check, CirclePlay, ClipboardPlus, Eye, Lock, Plus, X } from "lucide-react";
import { FC, use } from "react";
import { Card, CardTitle, Badge, Button } from "@/components";
import clsx from "clsx";
import { p } from "node_modules/shadcn/dist/index-8c784f6a";
import { useNavigate } from "react-router-dom";


export const FollowedTopic: FC<{topic: CreatedTopic, index: number, userTopic: UserTopic | undefined, isCourseFollowed: boolean}> = ({topic, index, isCourseFollowed, userTopic}) => {
    const navigate = useNavigate()


    return(
        <Card className="flex flex-row p-0 overflow-hidden gap-0 m-0">
            <div className="w-1.5 bg-primary shrink-0" />

            <div className="flex flex-col justify-center p-2 w-full">
                <div className="flex items-center justify-between">
                    {isCourseFollowed
                        ?   userTopic
                            ?   userTopic.is_available
                                ?   userTopic.is_completed
                                    ?   <Check className=" shrink-0 m-2" />
                                    :   <CirclePlay className=" shrink-0 m-2 " />
                                :   <Lock className=" shrink-0 m-2" />
                            :   <ClipboardPlus className="shrink-0 m-2" />
                        :   <Eye className="shrink-0 m-2" />
                    }
                    
                    <div className="mt-2">
                        <CardTitle>
                            <Badge 
                                variant="outline" 
                                className="px-2 py-0.5 mr-2"
                            >{topic.number_in_course + 1}
                            </Badge>
                            {topic.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                        {topic.description}
                        </p>
                    </div>
                    <div className="shrink-0 grow">
                        
                    </div>
            
                    <Badge variant="outline">
                        {topic.question_count} вопр.
                    </Badge>
                </div>
                
                <div className="flex-1 p-4">
                    <div 
                        className={clsx(
                            "mt-3 flex max-md:flex-col justify-center",
                            "max-md:items-baseline gap-4 items-center",
                            isCourseFollowed && !userTopic && 'max-md:items-center'
                        )}>
                        <div className="flex flex-col justify-center gap-1">
                            {userTopic 
                                ?   <>
                                        {userTopic.is_attempted
                                            ? userTopic.is_completed
                                                ?   <Badge variant='default' className= "border-green-500 border p-0 pr-2">
                                                        <Badge variant='outline' className="scale-105 gap-1 h-full border-none bg-green-500 mr-1">
                                                            <Check className="h-3 w-3" />
                                                            Пройдено
                                                        </Badge>
                                                        Баллы: {userTopic.progress.toFixed(1)}/1
                                                    </Badge>
                                                :   <div className="space-y-1">
                                                        <Badge variant='default' className= "border-red-500 border p-0 pr-2">
                                                            <Badge variant='outline' className="scale-105 gap-1 h-full border-none bg-red-500 mr-1">
                                                                <X className="h-3 w-3" />
                                                                Не пройдено
                                                            </Badge>
                                                            Баллы: {userTopic.progress.toFixed(1)}/1
                                                        </Badge>
                                                        <div className="text-xs text-red-600">
                                                            Минимум: {topic.score_for_pass} для зачета
                                                        </div>
                                                    </div>
                                            : <></>
                                        }
                                        {(userTopic.is_available && userTopic.is_active)
                                            ? topic.question_count
                                                ?   <span className="text-green-500">Доступно для прохождения</span>
                                                :   <span className="text-red-500">В данной теме нет вопросов<br />Заблокировано для прохождения</span>
                                            :   <span className="text-red-500">Заблокировано для прохождения</span>
                                        }
                                    </>
                                :   
                                    isCourseFollowed
                                        ?   <div className="flex flex-col items-center gap-3 p-3 border border-orange-200 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <ClipboardPlus className="h-5 w-5 text-orange-400" />
                                                    <span className="text-sm font-medium text-orange-600">Новая тема доступна!</span>
                                                </div>
                                                
                                                <div className="text-xs text-center text-orange-400 mb-1">
                                                    Эта тема еще не добавлена в ваш курс
                                                </div>
                                            </div>
                                        :   <span className="text-blue-400">Предпросмотр</span>
                            }
                        </div>

                        {userTopic
                            ?   <>
                                    <div className="shrink grow"></div>
                                    {userTopic.is_available && topic.question_count > 0 && userTopic.is_active && (
                                        <Button size="sm" variant='default'
                                            onClick={() => navigate(`/topic?utopic_id=${userTopic.id}&title=${topic.title}`, {state: {from: `${userTopic.id}`}})}
                                        >
                                            {userTopic.progress
                                                ? userTopic.is_completed
                                                    ? 'Перепройти'
                                                    : 'Повторить'
                                                : 'Начать'}
                                        </Button>
                                    )}
                                </>
                            :   isCourseFollowed
                                ?  <></>
                                :   <div className="shrink grow"></div>
                        }
                    </div>
                </div>
            </div>
        </Card>
    )
}