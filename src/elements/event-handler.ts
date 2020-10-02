import { AggregateState } from './aggregate-state'
import { Event } from './event'

export type EventHandler<
  TEvent extends Event,
  TAggregateState extends AggregateState
> = (event: TEvent) => TAggregateState
