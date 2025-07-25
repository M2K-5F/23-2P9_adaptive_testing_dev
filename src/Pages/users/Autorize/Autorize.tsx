import { isRouteErrorResponse, useNavigate } from "react-router-dom"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Button } from "@/Components/ui/button"
import { useAuth } from "./hooks/useAuth"

export default function Autorize () {
    const nav = useNavigate()
    const {
        loginHandler, 
        passwordHandler, 
        handleAuth,
        isAuthError, 
        isLoginFieldError, 
        isPasswordFieldError,
        loginFieldValue,
        passwordFieldValue
    } = useAuth()


    return (
        <main className={'flex h-dvh justify-center items-center '}>
            <Card className="scale-110 w-full max-w-sm h-fit mb-30">
                <CardHeader>
                    <CardTitle className={'text-center'}>Войти в свой аккаунт</CardTitle>
                    <CardDescription>
                        Войти в аккаунт используя логин и пароль
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                        <Label htmlFor="email">Логин</Label>
                        <Input
                            value={loginFieldValue}
                            onChange={e => {
                                const v = e.currentTarget.value
                                loginHandler(v)
                            }}
                            id='text'
                            type='text'
                            placeholder="login"
                            required
                        />
                        {isLoginFieldError && <Label className={'font-medium text-red-700'}>Логин должен содержать минимум 3 символа</Label>}
                        </div>
                        <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Пароль</Label>
                        </div>
                        <Input 
                            value={passwordFieldValue}
                            onChange={(e) => {
                                const v = e.currentTarget.value
                                passwordHandler(v)
                            }}
                            id="password" 
                            type="password" 
                            placeholder="password"
                            required />
                            {isPasswordFieldError && <Label className={'font-medium text-red-700'}>Пароль должен содержать минимум 3 символа</Label>}
                        </div>
                    </div>
                    </form>
                </CardContent>

                <CardFooter className="flex-col gap-2">
                    <Button onClick={handleAuth} type="button" variant='default' className="w-full">
                        Войти
                    </Button>
                    {isAuthError && <Label className="font-medium text-red-700">Неверный логин или пароль!</Label>}
                    <Button onClick={() => nav('/users/registration')} variant="link">Зарегистрироваться</Button>
                </CardFooter>
            </Card>
    </main>
    )
}
