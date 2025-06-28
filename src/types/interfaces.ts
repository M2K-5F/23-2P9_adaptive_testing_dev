export type status = 'teacher' | 'student' | "forbidden" | "unautorized" | "undefined" | "serverunavailable"

export interface userStoreShema {
    nick: string | undefined,
    status: status,
    RegUser: (data:userShema) => void,
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

export interface userShema {
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
    question_type: 'single'
    text: string,
    answer_options: Answer[]
}

export interface Form {
    title: string,
    description: string,
    questions: Question[]
}

export interface ShowFormShema {
    form: Form,
    setForm: (_:Form) => void
}


export interface CreatedCourse {
    created_by: string,
    id: number,
    is_active: boolean,
    title: string
}


export interface FollowedCourse {
    id: number,
    user: string,
    course: CreatedCourse,
    course_progress: number
}

export interface CreatedTopic extends CreatedCourse {
    description: string
}

export interface FormCreate extends Partial<Form>{}


