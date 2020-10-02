import { Command, CommandDefinition } from './command'
import { Event, EventDefinition } from './event'

export type AggregateState = {
  [key: string]: any
}

export type AggregateDefinition = {
  commands: {
    [commandName: string]: CommandDefinition<Command<any>, Event<any>>
  }

  events: {
    [eventName: string]: EventDefinition<Event<any>, AggregateState>
  }
}
