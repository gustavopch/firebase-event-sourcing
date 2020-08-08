import { Command } from '../elements/command'
import { Event } from '../elements/event'
import { CommandDefinition } from './command-definition'

export type AggregateDefinition = {
  commands: {
    [commandName: string]: CommandDefinition<Command<any, any>, Event<any, any>>
  }
}
