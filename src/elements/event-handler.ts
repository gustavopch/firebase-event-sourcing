import { Event } from './event'
import { State } from './state'

export type EventHandler<TEvent extends Event, TState extends State> = (
  event: TEvent,
) => TState
