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
    [commandName: string]: CommandDefinition<any, Command<any>, Event<any>>
  }

  events: {
    [eventName: string]: EventDefinition<any, Event<any>>
  }
}
