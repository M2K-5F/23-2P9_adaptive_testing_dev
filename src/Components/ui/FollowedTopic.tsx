import { CreatedTopic, UserTopic } from "@/types/interfaces";
import { Check, CirclePlay, Eye, Lock, X } from "lucide-react";
import { FC, use } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import clsx from "clsx";
import { Button } from "./button";
import { SelectSeparator } from "@radix-ui/react-select";
import { Badge } from "./badge";


const MIN_COMPLETION_PERCENT = 80

export const FollowedTopic: FC<{topic: CreatedTopic, index: number, userTopic: UserTopic | undefined}> = ({topic, index, userTopic}) => {
    return(
        <Card className="flex flex-row p-0 overflow-hidden gap-0 m-0">
            <div className="w-1.5 bg-primary shrink-0" />

            {userTopic && !userTopic?.ready_to_pass && <Lock className=" shrink-0 p-0 ml-4 mt-4" /> }
            {userTopic?.ready_to_pass &&!userTopic.is_completed && <CirclePlay className=" shrink-0 p-0 ml-4 mt-4" /> }
            {userTopic?.ready_to_pass && userTopic?.is_completed && <Check className=" shrink-0 p-0 ml-4 mt-4" /> }
            {!userTopic && <Eye className="shrink-0 ml-4 mt-4" /> }
            
            <div className="flex-1 p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{topic.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                        {topic.description}
                        </p>
                    </div>
                    
                    <Badge variant="outline">
                        {topic.question_count} вопр.
                    </Badge>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                    <div className="flex flex-col justify-center gap-0">
                        {userTopic && userTopic.topic_progress > 0 && (userTopic.is_completed
                                    ?   <>
                                            <span className=" inline text-sm text-green-400">
                                                <Check className="inline h-4 w-4 text-green-500" />
                                            Пройдено</span>
                                            <span className="text-sm">Баллы: {userTopic.topic_progress}/1 </span>
                                        </>
                                    :   <>
                                            <X className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-red-400">Не пройдено</span>
                                            <span className="text-sm">Баллы: {userTopic.topic_progress}/1</span><br />
                                            <span className="text-sm">Необходимо для прохождения: 0.8</span>
                                        </>
                        )}
                        <span 
                            className={clsx(
                                "text-sm block ",
                                userTopic ? userTopic.ready_to_pass ? 'text-green-400' : 'text-red-400' : 'text-blue-400'
                            )}
                        >{userTopic ? userTopic.ready_to_pass ? 'Доступно для прохождения' : 'Заблокировано для прохождения' : 'Предпросмотр темы'}
                        </span>
                        
                    </div>
                
                    {userTopic?.ready_to_pass 
                        &&  <Button size="sm" variant='default'>
                                {userTopic && userTopic.topic_progress ? userTopic.is_completed ? 'Перепройти' : 'Повторить' : 'Начать'}
                            </Button>
                        
                    }
                </div>
            </div>
        </Card>
    )
}