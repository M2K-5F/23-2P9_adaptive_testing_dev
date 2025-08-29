import { useRegStore } from "./store/useRegStore"
import { Input } from "@/Components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/Components/ui/select"
import { Button } from "@/Components/ui/button"
import { AuthLayout, ValueContext } from "@/Layouts/AuthLayout"
import { useContext, useEffect } from "react"

export default function Regisration () {
    const setPage = useContext(ValueContext)!
    const {values, role, errors, setRole, fieldSetter, useRegistration, reset} = useRegStore()


    useEffect(reset, [])


    return(
        <Card className="w-full ">
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
                        <Input placeholder="used for login" id="username" value={values.username} onChange={fieldSetter}/>
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
            
                    <div className="grid grid-cols-5 gap-x-2 items-baseline">
                    
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
                    
                        <div className="grid gap-2 col-start-3 col-end-6">
                            <Label htmlFor="name">Имя пользователя:</Label>
                            <Input id="name" value={values.name} onChange={fieldSetter} placeholder="viewed name" /> 
                            {errors.name == 'unvalid' && 
                                <Label className={'font-medium text-red-700'}>
                                    Имя должно содержать минимум 3 символа
                                </Label>
                            }
                        </div>
                    </div>
            
                    <div className="grid gap-x-2 grid-cols-2 items-baseline">
                    
                        <div className="grid gap-2">
                            <Label>Пароль:</Label>
                            <Input value={values.password} onChange={fieldSetter} id="password" placeholder="password" />
                            {errors.password == 'unvalid' && 
                                <Label className={'font-medium text-red-700'}>
                                    Пароль должен содержать минимум 3 символа
                                </Label>
                            }
                        </div>
                    
                        <div className="grid gap-2">
                            <Label>Повтор пароля:</Label>
                            <Input id="repeat" value={values.repeat} onChange={fieldSetter} placeholder="repeat" /> 
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