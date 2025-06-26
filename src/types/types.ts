import { ShowFormShema } from "../types/interfaces"
import { RefObject } from "react"

type Theme = 'light' | 'dark'

type Status = 'Student' | 'Teacher' | unknown

export type modal = RefObject<null | HTMLDialogElement>

export {Theme, Status}