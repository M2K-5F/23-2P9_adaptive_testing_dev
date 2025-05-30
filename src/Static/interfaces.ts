
import { Status} from './types'

interface userStoreShema {
    nick: string | undefined,
    status: 'teacher' | 'student',
    RegUser: (data:userShema, isRemember: boolean) => void,
    DelUser: Function
}

export interface RegistrationForm {
    nickname: string
    name:string
    telegram_link: string
    role: 'student' | 'teacher'
    password: string
    password_rp: string
}

interface userShema {
    nick: string | undefined,
    status: 'teacher' | 'student',
}

export interface Answer {
    id?: number
    text: string
    is_correct? : boolean
}

export interface Question {
    id?: number
    question_type: 'single_choice'
    text: string,
    answer_options: Answer[]
}

interface Form {
    title: string,
    description: string,
    questions: Question[]
}

interface ShowFormShema {
    form: Form,
    setForm: (_:Form) => void
}

export interface FormCreate extends Partial<Form>{}

export {userShema, userStoreShema, ShowFormShema, Form}

