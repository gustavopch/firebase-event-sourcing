import { Event } from '../elements/event'
import { EventHandler } from '../elements/event-handler'
import { State } from '../elements/state'

export type EventDefinition<TEvent extends Event, TState extends State> = {
  handle: EventHandler<TEvent, TState>
}
