const CREATE = Symbol('CREATE')
const UPDATE = Symbol('UPDATE')
const DELETE = Symbol('DELETE')
const WRITE = Symbol('WRITE')

export const Trigger = {
  CREATE,
  UPDATE,
  DELETE,
  WRITE,
} as const

export type Trigger = typeof Trigger[keyof typeof Trigger]
