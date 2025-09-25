export type status = 'authorized' | "forbidden" | "unauthorized" | "undefined" | "serverunavailable"
export type role = 'teacher' | 'student' | "undefined"

export interface userStoreShema {
    username: string,
    name: string
    status: status,
    telegram_link: string
    roles: role[]
    regUser: (user: UserShema) => void
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


export interface UserShema {
    id: number
    username: string,
    name: string    
    telegram_link: string
    roles: role[]
}


export interface CreatedCourseBase {
    created_by: UserShema,
    description: string
    id: number,
    is_active: boolean,
    title: string
}


export interface CreatedCourse extends CreatedCourseBase {
    student_count: number
    topic_count: number
    group_count: number
    created_at: string
}


export interface CreatedGroup {
    id: number
    by_course: CreatedCourse
    created_by: UserShema
    title: string
    student_count: number
    max_student_count: number
    is_active: boolean
}


export interface UserGroup {
    id: number
    user: UserShema
    group: CreatedGroup
    course: CreatedCourse
    progress: number
    completed_topic_count: number
}


export interface FetchedCourse extends CreatedCourseBase {
    user_group: UserGroup | false
}


export interface FetchedGroup extends CreatedGroup {
    user_group: UserGroup | false
}


export interface CreatedTopic extends CreatedCourseBase {
    number_in_course: number
    question_count: number
    by_course: CreatedCourse
    score_for_pass: number
}

export interface UserTopic {
    id: number
    user: string
    topic: CreatedTopic
    by_user_group: UserGroup
    is_available: boolean
    is_attempted: boolean
    attempt_count: boolean
    is_completed: boolean
    progress: number
    is_active: boolean
}

export interface AnswerOption {
    id?: number
    text: string
    is_correct: boolean
    by_question: CreatedQuestion
}

export interface QuestionCreate {
    text: string
    answer_options: AnswerCreate[]
}


export interface AnswerCreate {
    text: string
    is_correct: boolean
}


export interface TextAnswerCreate {
    text: string
}


export interface CreatedQuestion {
    id: number
    text: string
    by_topic: CreatedTopic
    question_type: 'single' | 'multiple' | 'text'
    is_active: boolean
    answer_options: AnswerOption[]
}

export interface CompletedTopic {
    user_topic_id: number
    questions: (CompletedQuestion | CompletedTextQuestion)[]
}

export interface CompletedTextQuestion {
    id: number
    text: string
    by_topic: number
    type: 'text'
}

export interface CompletedQuestion {
    id: number
    answer_options: CompletedOption[]
    by_topic: number
    type: 'choice'
}

export interface CompletedOption {
    id: number
    is_correct: boolean
}

export interface QuestionToPass {
    id: number
    text: string
    by_topic: CreatedTopic
    question_type: 'single' | 'multiple' | 'text'
    is_active: boolean
    answer_options: OptionToPass[]
}

export interface OptionToPass {
    id: number
    text: string
}

export interface UnsubmitedAnswer {
    id: number
    user: UserShema
    question: {
        id: number
        text: string
        by_topic: number
        question_type: 'text'
        is_active: boolean
    }
    by_user_topic: UserTopic
    for_user_question: {
        id: number
        user: string
        by_user_topic: number
        question: number
        question_score: number
    }
    text: string
    is_correct: false
    is_active: true
}


export interface CourseStatistics {
    course_id: string
    course_title: string
    meta: {
        avg_progress: number
        total_students: number
        completed_user_groups: number
    }
    group_details: GroupDetail[]
}

export interface GroupDetail {
    id: number
    avg_progress: number
    title: string
    max_student_count: number
    student_count: number
    user_group_details: UserGroupDetail[]
}

export interface UserGroupDetail {
    user: UserShema
    progress: number
    completed_topics: number
    total_topics: number
    user_topic_details: UserTopicDetail[]
}

export interface UserTopicDetail {
    topic_title: string
    is_completed: boolean
    score_for_pass: number
    progress: number
    attempt_count: number
    question_count: number
    ready_to_pass: boolean
    unsubmited_answers: UnsubmitedAnswer[]
}


export interface QuestionWeight {
    id: number;
    created_at: string;
    group: CreatedGroup
    question: CreatedQuestion
    weigth: number;
    step: number;
    max_weigth: number;
    min_weigth: number;
}

export interface CourseStats extends CourseStatistics {}
