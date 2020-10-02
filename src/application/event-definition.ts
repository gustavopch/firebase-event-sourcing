import { AggregateState } from '../elements/aggregate-state'
import { Event } from '../elements/event'
import { EventHandler } from '../elements/event-handler'

export type EventDefinition<
  TEvent extends Event,
  TAggregateState extends AggregateState
> = {
  handle: EventHandler<TEvent, TAggregateState>
}
