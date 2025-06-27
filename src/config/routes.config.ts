import { status } from "../types/interfaces"

export const Paths = {
    'student': ['/forstudent', '/showform'],
    'teacher': ['/forteacher', '/createform', '/forteacher/results', `/course`, '/edit/course'],
    'forbidden': ['/403', '/users/autorize', '/users/registration'],
    'unautorized': ['/401', '/users/autorize', '/users/registration'],
    'undefined': ['/users/autorize', '/users/registration', '/forstudent', '/showform', '/forteacher', '/createform', '/forteacher/results'],
    'serverunavailable': ['/users/autorize', '/users/registration', '/forstudent', '/showform', '/forteacher', '/createform', '/forteacher/results']
}


export const isPathAvailable = (status: status) => {
    return Paths[status].includes(window.location.pathname)
}