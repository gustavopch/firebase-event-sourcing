import { Command } from '../elements/command'
import { Event } from '../elements/event'
import { CommandDefinition } from './command-definition'
import { EventDefinition } from './event-definition'

export type AggregateDefinition = {
  commands: {
    [commandName: string]: CommandDefinition<Command<any, any>, Event<any, any>>
  }

  events: {
    [eventName: string]: EventDefinition<Event<any, any>, any>
  }
}
