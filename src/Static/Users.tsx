import { use } from "react"
import { userShema } from "./interfaces"

type Status = 'student' | 'teacher'
type login = string


interface User {
    name: string,
    password: string,
    status: Status
}

interface Auth {
    login: string,
    password: string,
    remember: boolean,
    formdata?: FormDataEntryValue
}

const Users:User[] = [
    {
        name: "111",
        password: '111',
        status: 'student'
    },
    {
        name: 'janpol',
        password:'12345',
        status: "teacher"
    }
]

function Identification<T>(nick: T): boolean {
    for (const user of Users) {
        if (user.name === nick) {
            return true
        }
    }   
    return false
}

const Authentification = (nick: string, pass: string| number): false|User => {
    for (const user of Users) {
        if (user.name === nick) {
            if (user.password === pass) {
                return user
            }
        }
    }
    return false
}

export {Authentification, Identification, Auth}