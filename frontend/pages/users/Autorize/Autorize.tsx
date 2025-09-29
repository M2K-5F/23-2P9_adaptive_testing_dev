import { isRouteErrorResponse, useNavigate } from "react-router-dom"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox, Label } from "@/components"
import { Button } from "@/components/ui/button"
import { useAuth } from "./hooks/useAuth"
import { useContext, useRef } from "react"
import { ValueContext } from "@/layouts/AuthLayout"
import clsx from "clsx"

export default function Autorize () {
    const setValue = useContext(ValueContext)
    const form = useRef<HTMLFormElement>(null)
    const {
        Error,
        handleAuth,
        resetError
    } = useAuth()


    return (
            <Card className="w-full max-w-sm h-fit mb-[14px]">
                
                <CardHeader className="text-center">
                    <CardTitle className={'text-center'}>Войти в свой аккаунт</CardTitle>
                    <CardDescription>
                        Войти в аккаунт используя логин и пароль
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form ref={form}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Логин</Label>
                                <Input
                                    onChange={() => resetError('login')}
                                    id='text'
                                    type='text'
                                    placeholder="логин"
                                    name="login"
                                    required
                                />
                                {Error.field === 'login' && 
                                    <Label className={'font-medium text-red-700'}>Логин должен содержать минимум 3 символа</Label>
                                }
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Пароль</Label>
                                </div>
                                <Input
                                onChange={() => resetError('password')}
                                    id="password" 
                                    type="password" 
                                    name="password"
                                    placeholder="пароль"
                                    required 
                                />
                                {Error.field === 'password' && 
                                    <Label className={'font-medium text-red-700'}>Пароль должен содержать минимум 3 символа</Label>
                                }
                            </div>
                            <div className={clsx('flex w-full justify-center gap-2')} >
                                <Checkbox onChange={() => resetError('remember')} defaultChecked={false} name="remember" id="remember"/>
                                <Label>Запомнить меня</Label>
                            </div>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                    <Button onClick={() => form.current && handleAuth(form.current)} type="button" variant='default' className="w-full">
                        Войти
                    </Button>
                    {Error.field === 'auth' && <Label className="font-medium text-red-700">Неверный логин или пароль!</Label>}
                    <Button onClick={() => setValue && setValue('reg')} variant="link">Зарегистрироваться</Button>
                </CardFooter>
            </Card>
    )
}
