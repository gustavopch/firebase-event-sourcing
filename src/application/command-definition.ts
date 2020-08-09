import { Command } from '../elements/command'
import { CommandHandler } from '../elements/command-handler'
import { Event } from '../elements/event'

export type CommandDefinition<
  TCommand extends Command,
  TEvent extends Event
> = {
  isAuthorized: (command: TCommand) => boolean | Promise<boolean>
  handle: CommandHandler<TCommand, TEvent>
}
