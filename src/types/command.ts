import { AggregatesService } from '../services/aggregates-service'
import { AggregateState } from './aggregate'
import { Event, EventCreationProps } from './event'
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

export type CommandCreationProps<
  TCommand extends Command = Command
> = TCommand extends any ? Pick<TCommand, 'name' | 'data'> : never

export type CommandPreset<
  TContextName extends string,
  TAggregateName extends string,
  TEventCreationProps extends EventCreationProps
> = Command<{
  contextName: TContextName
  aggregateName: TAggregateName
  name: TEventCreationProps['name']
  data: TEventCreationProps['data']
}>

export type CommandHandler<
  TAggregateState extends AggregateState,
  TCommand extends Command,
  TEvent extends Event
> = (
  state: TAggregateState | null,
  command: TCommand,
  services: { aggregates: AggregatesService },
) => EventCreationProps<TEvent> | Array<EventCreationProps<TEvent>>

export type CommandDefinition<
  TAggregateState extends AggregateState,
  TCommand extends Command,
  TEvent extends Event
> = {
  isAuthorized?: (command: TCommand) => boolean | Promise<boolean>
  handle: CommandHandler<TAggregateState, TCommand, TEvent>
}
