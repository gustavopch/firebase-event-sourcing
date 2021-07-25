import * as commands from './commands'
import * as events from './events'
import { getInitialState } from './state'

export const aggregate = {
  getInitialState,
  commands,
  events,
}
