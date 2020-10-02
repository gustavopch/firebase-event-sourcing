import { Event } from './event'
import { ClientInfo } from './misc'

export type CommandData = {
  [key: string]: any
} | null

export type CommandMetadata = {
  causationId: string | null
  correlationId: string | null
  client: ClientInfo | null
}

export type Command<
  TProps extends {
    contextName: string
    aggregateName: string
    name: string
    data: CommandData
  } = {
    contextName: string
    aggregateName: string
    name: string
    data: CommandData
  }
> = {
  contextName: TProps['contextName']
  aggregateName: TProps['aggregateName']
  aggregateId: string
  name: TProps['name']
  data: TProps['data']
}

export type CommandWithMetadata = Command & {
  metadata: CommandMetadata
}

export type CommandHandler<TCommand extends Command, TEvent extends Event> = (
  command: TCommand,
) => {
  name: TEvent['name']
  data: TEvent['data']
}

export type CommandDefinition<
  TCommand extends Command,
  TEvent extends Event
> = {
  isAuthorized?: (command: TCommand) => boolean | Promise<boolean>
  handle: CommandHandler<TCommand, TEvent>
}
