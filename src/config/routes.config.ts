import { role, status } from "../types/interfaces"

export const Paths = {
    'student': ['/forstudent', '/showform', '/course'],
    'teacher': ['/forteacher', '/createform', '/forteacher/results', `/course`, '/edit/course'],
    'forbidden': ['/403', '/users/autorize', '/users/registration'],
    'unauthorized': ['/401', '/users/autorize', '/users/registration'],
    'undefined': ['/users/autorize', '/users/registration', '/forstudent', '/showform', '/forteacher', '/createform', '/forteacher/results'],
    'serverunavailable': ['/users/autorize', '/users/registration', '/forstudent', '/showform', '/forteacher', '/createform', '/forteacher/results']
}


export const isStatusPathAvailable = (status: status | role) => {
    return Paths[status].includes(window.location.pathname)
}

export const isRolePathAvailable = (roles: role[]) => {
    let shouldRedirect = true
    for (const role of roles) {
        if (isStatusPathAvailable(role)) {
            shouldRedirect = false
            break
        }
    }
    return !shouldRedirect
}