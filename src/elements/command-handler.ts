import { Command } from './command'
import { Event } from './event'

export type CommandHandler<TCommand extends Command, TEvent extends Event> = (
  data: TCommand['data'],
) => {
  name: TEvent['name']
  data: TEvent['data']
}
