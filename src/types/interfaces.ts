export type status = 'authorized' | "forbidden" | "unauthorized" | "undefined" | "serverunavailable"
export type role = 'teacher' | 'student' | "undefined"

export interface userStoreShema {
    nick: string ,
    status: status,
    role: role[]
    regUser: (user: fetchedUserShema) => void
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


export interface UserCourse {
    id: number,
    user: string,
    course: CreatedCourse,
    course_progress: number
    is_active: boolean
    completed_topic_number: number
}


export interface FetchedCourse extends CreatedCourse {
    user_course: UserCourse | false
}


export interface CreatedTopic extends CreatedCourse {
    description: string
    number_in_course: number
    question_count: number
    by_course: number
}

export interface UserTopic {
    id: number
    topic: CreatedTopic
    by_user_course: UserCourse
    ready_to_pass: boolean
    is_completed: boolean
    topic_progress: number
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

export interface CompletedTopic {
    user_topic_id: number
    questions: CompletedQuestion[]
}

export interface CompletedQuestion {
    id: number
    answer_options: CompletedOption[]
}

export interface CompletedOption {
    id: number
    is_correct: boolean
}

export interface QuestionToPass {
    id: number
    text: string
    by_topic: number
    question_type: 'single' | 'multiple'
    is_active: boolean
    answer_options: OptionToPass[]
}

export interface OptionToPass {
    id: number
    text: string
}

export interface TopicDetail {
    topic_id: number
    topic_title: string
    is_completed: boolean
    topic_progress: number
    question_count: number
    average_score: number
    ready_to_pass: boolean
}

export interface StudentStats {
    user_id: number
    username: string
    name: string
    telegram_link: string
    course_progress: number
    completed_topics: number
    total_topics: number
    topics_details: TopicDetail[]
}

export interface CourseStats {
    course_id: number
    course_title: string
    total_students: number
    average_progress: number
    students: StudentStats[]
}

export interface FormCreate extends Partial<Form>{}


