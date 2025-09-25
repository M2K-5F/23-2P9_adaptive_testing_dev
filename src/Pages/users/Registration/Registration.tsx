import { useRegStore } from "./store/useRegStore"
import { Input } from "@/Components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Button } from "@/Components/ui/button"
import { AuthLayout, ValueContext } from "@/Layouts/AuthLayout"
import { useContext, useEffect } from "react"
import clsx from "clsx"

export default function Regisration () {
    const setPage = useContext(ValueContext)!
    const {values, role, errors, setRole, fieldSetter, useRegistration, reset} = useRegStore()


    useEffect(reset, [])


    return(
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>
                    Зарегистрировать новую учетную запись
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-y-4">
            
                    <div className="grid gap-2 items-baseline">
                        <Label htmlFor="username">Логин:</Label>
                        <Input placeholder="никнейм" id="username" value={values.username} onChange={fieldSetter}/>
                        {errors.username == 'unvalid' && 
                            <Label className={'font-medium text-red-700'}>
                                Логин должен содержать минимум 3 символа
                            </Label>
                        }

                        {errors.username === 'alreadyused' && 
                            <Label className="font-medium text-red-700">
                                Логин или имя пользователя заняты
                            </Label>
                        }
                    </div>
            
                    <div className="flex flex-nowrap gap-2">
                    
                        <div className="grid gap-2 col-start-1 col-end-3">
                            <Label>Роль:</Label>
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger className="max-w-full w-full">
                                    <SelectValue placeholder='Выбрать роль'/>
                                </SelectTrigger>
                                <SelectContent >
                                    <SelectGroup>
                                        <SelectLabel>Роли</SelectLabel>
                                        <SelectItem value="student">Студент</SelectItem>
                                        <SelectItem value="teacher">Преподаватель</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    
                        <div className="grid gap-2 col-start-3 col-end-6 grow">
                            <Label htmlFor="name">Имя пользователя:</Label>
                            <Input id="name" value={values.name} onChange={fieldSetter} placeholder="имя" /> 
                            {errors.name == 'unvalid' && 
                                <Label className={'font-medium text-red-700'}>
                                    Имя должно содержать минимум 3 символа
                                </Label>
                            }
                        </div>
                    </div>

                    <div>
                        <div className="grid gap-2">
                            <Label htmlFor="telegram_link">Ссылка на телеграм:</Label>
                            <Input value={values.telegram_link} onChange={fieldSetter} id="telegram_link" placeholder="ссылка на телеграм" />
                            {errors.telegram_link == 'unvalid' && 
                                <Label className={'font-medium text-red-700'}>
                                    Ссылка должна содержать минимум 3 символа
                                </Label>
                            }
                            {errors.telegram_link === 'validate_error' &&
                                <Label className={clsx('font-medium text-red-700')}>
                                    Невалидная ссылка
                                </Label>
                            }
                        </div>
                    </div>
            
                    <div className="grid gap-x-2 grid-cols-2 items-baseline">
                    
                        <div className="grid gap-2">
                            <Label>Пароль:</Label>
                            <Input value={values.password} onChange={fieldSetter} id="password" placeholder="пароль" />
                            {errors.password == 'unvalid' && 
                                <Label className={'font-medium text-red-700'}>
                                    Пароль должен содержать минимум 3 символа
                                </Label>
                            }
                        </div>
                    
                        <div className="grid gap-2">
                            <Label>Повтор пароля:</Label>
                            <Input id="repeat" value={values.repeat} onChange={fieldSetter} placeholder="повтор" /> 
                            {errors.repeat === 'unvalid' || errors.repeat === 'notmatches' && 
                                <Label className={'font-medium text-red-700'}>
                                    Пароли не совпадают
                                </Label>
                            }
                        </div>
                    
                    </div>
            
                    <Button onClick={() => useRegistration(setPage)} type="button">Зарегистрироваться</Button>
            
                </form>
            </CardContent>
        </Card>
    )
}