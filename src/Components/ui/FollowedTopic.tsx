import { CreatedTopic, UserTopic } from "@/types/interfaces";
import { Check, CirclePlay, Eye, Lock } from "lucide-react";
import { FC } from "react";
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
                    <div className="flex items-center gap-2">
                        {userTopic?.is_completed 
                            ?   <>
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">Пройдено</span>
                                </>
                            :   <span 
                                    className={clsx(
                                        "text-sm ",
                                        userTopic?.ready_to_pass ? 'text-green-400' : 'text-red-400'
                                    )}
                                >{userTopic?.ready_to_pass ? 'Доступно' : 'Заблокировано'}
                                </span>
                        }
                    </div>
                
                    {userTopic?.ready_to_pass 
                        &&  <Button size="sm" variant='default'>
                                {userTopic?.is_completed ? 'Повторить' : 'Начать'}
                            </Button>
                        
                    }
                </div>
            </div>
        </Card>
    )
}