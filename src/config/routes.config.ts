import { role, status } from "../types/interfaces"

export const Paths: Readonly<Record<status, string[]>> = {
    'forbidden': ['/403', '/users/autorize', '/users/registration'],
    'unauthorized': ['/401', '/users/autorize', '/users/registration'],
    'undefined': [window.location.pathname],
    'serverunavailable': ['/503'],
    "authorized": []
} as const

export const isStatusPathAvailable = (status: status) => { 
    return Paths[status].includes(window.location.pathname) 
}


export const routes = {
    home: '/',
    editCourse: (courseId: number, expanded: number = 0) => `/edit/course?course_id=${courseId}&expanded=${expanded}`,
    viewCourse: (fcourseId: number) => `/course?fcourse_id=${fcourseId}`,
}