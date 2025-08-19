import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
    Button, Avatar, AvatarFallback, AvatarImage,
    ThemeSwitcher
} from "@/Components"
import { userStore } from "@/stores/userStore"
import clsx from "clsx"
import { LogOut } from "lucide-react"
import React, { useState } from "react"

export const UserMenu = React.memo(() => {
    const nick = userStore(state => state.nick)
    const logout = userStore(state => state.DelUser)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <DropdownMenu open={isOpen}  onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className={clsx(
                    'p-2 hover:bg-secondary/50 rounded-lg',
                    'flex flex-row font-medium text-sm',
                    'justify-center items-center gap-2'
                )} >
                <Avatar className="h-8 w-8">
                    <AvatarFallback>
                    {nick.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span>Профиль</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{nick}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* 
                <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Выйти</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className={clsx('flex w-full flex-row px-2 py-1')} >    
                    <ThemeSwitcher />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
})