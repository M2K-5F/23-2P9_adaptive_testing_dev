export type status = 'authorized' | "forbidden" | "unauthorized" | "undefined" | "serverunavailable"
export type role = 'teacher' | 'student' | "undefined"

export interface userStoreShema {
    nick: string ,
    status: status,
    role: role[]
    regUser: (userShema) => void
    DelUser: Function
    pingUser: () => void
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
    role: role[]
}

export interface fetchedUserShema {
    nick: string,
    status: role[]
}

export interface Answer {
    id?: number
    text: string
    is_correct? : boolean
}

export interface Question {
    id?: number
    question_type: 'single' | 'multiple'
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

export interface FetchedTopic extends CreatedTopic {
    number_in_course: number
    count: number
}

export interface AnswerOption {
    id?: number
    text: string
    is_correct: boolean
    by_question: number
}

export interface CreatedQuestion {
    id: number
    text: string
    by_topic: number
    question_type: 'single' | 'multiple'
    is_active: boolean
    answer_options: AnswerOption[]
}

export interface FormCreate extends Partial<Form>{}


