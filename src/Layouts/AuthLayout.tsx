import { ThemeSwitcher } from "@/Components/ui/ThemeSwither";
import { ToggleGroup, ToggleGroupItem } from "@/Components/ui/toggle-group";
import { createContext, Dispatch, FC, SetStateAction, useEffect, useLayoutEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from '@/Components/ui/sonner';

export const ValueContext = createContext<Dispatch<SetStateAction<"auth" | "reg">> | undefined>(undefined)

export const AuthLayout: FC = () => {
    const [value, setValue] = useState<'auth' | 'reg'>(window.location.pathname.endsWith('registration')? 'reg' : 'auth')
    const navigate = useNavigate()
    

    useLayoutEffect(() => {navigate(`/users/${value === 'auth' ? "autorize": "registration"}`)}, [value])

    return (
            <main className={'flex h-dvh justify-center items-center flex-col pb-10'}>
                <Toaster position='top-center' /> 
                <div className="scale-110 h-fit max-w-md w-md flex-col flex items-center gap-2">
                    <div className="grid grid-cols-3 w-full items-center justify-items-center">
                        <ToggleGroup className="col-start-2" value={value} type='single'>
                            <ToggleGroupItem onClick={() => setValue('auth')} value="auth">Авторизация</ToggleGroupItem>
                            <ToggleGroupItem onClick={() => setValue('reg')} value="reg">Регистрация</ToggleGroupItem>
                        </ToggleGroup>
                        <ThemeSwitcher />
                    </div>
                    <ValueContext.Provider value={setValue}>
                        <Outlet />
                    </ValueContext.Provider>
                </div>
            </main>
    )
}