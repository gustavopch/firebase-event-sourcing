import { Command } from '../elements/command'
import { Event } from '../elements/event'
import { State } from '../elements/state'
import { CommandDefinition } from './command-definition'
import { EventDefinition } from './event-definition'

export type AggregateDefinition = {
  commands: {
    [commandName: string]: CommandDefinition<Command<any>, Event<any>>
  }

  events: {
    [eventName: string]: EventDefinition<Event<any>, State>
  }
}
