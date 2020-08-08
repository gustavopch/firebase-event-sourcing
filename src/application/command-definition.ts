import { Command } from '../elements/command'
import { CommandHandler } from '../elements/command-handler'
import { Event } from '../elements/event'

export type CommandDefinition<
  TCommand extends Command,
  TEvent extends Event
> = {
  handle: CommandHandler<TCommand, TEvent>
}
