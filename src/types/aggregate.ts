import { Command, CommandDefinition } from './command'
import { Event, EventDefinition } from './event'

export type AggregateState = {
  [key: string]: any
}

export type Aggregate<
  TAggregateState extends AggregateState = AggregateState
> = {
  id: string
  revision: number
  state: TAggregateState
}

export type GetInitialAggregateState<
  TAggregateState extends AggregateState
> = () => TAggregateState

export type AggregateDefinition = {
  getInitialState?: GetInitialAggregateState<AggregateState>

  commands: {
    [commandName: string]: CommandDefinition<Command<any>, Event<any>>
  }

  events: {
    [eventName: string]: EventDefinition<Event<any>, any>
  }
}
