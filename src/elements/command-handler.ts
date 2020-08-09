import { Command } from './command'
import { Event } from './event'

export type CommandHandler<TCommand extends Command, TEvent extends Event> = (
  command: TCommand,
) => {
  name: TEvent['name']
  data: TEvent['data']
}
