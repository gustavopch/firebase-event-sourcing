import { Command } from '../../elements/command'
import { CommandHandler } from '../../elements/command-handler'
import { Event } from '../../elements/event'

export type AggregateDefinition = {
  commands: {
    [commandName: string]: CommandHandler<Command<any, any>, Event<any, any>>
  }
}
