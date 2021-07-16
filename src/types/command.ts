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
    aggregateName: string
    name: string
    data: CommandData
  } = {
    aggregateName: string
    name: string
    data: CommandData
  },
> = {
  aggregateName: TProps['aggregateName']
  aggregateId: string
  name: TProps['name']
  data: TProps['data']
}

export type CommandWithMetadata = Command & {
  metadata: CommandMetadata
}

export type CommandCreationProps<TCommand extends Command = Command> =
  TCommand extends any ? Pick<TCommand, 'name' | 'data'> : never

export type CommandPreset<
  TAggregateName extends string,
  TEventCreationProps extends EventCreationProps,
> = Command<{
  aggregateName: TAggregateName
  name: TEventCreationProps['name']
  data: TEventCreationProps['data']
}>

export type CommandHandler<
  TAggregateState extends AggregateState,
  TCommand extends Command,
  TEvent extends Event,
> = (
  state: TAggregateState | null,
  command: TCommand,
  services: { aggregates: AggregatesService },
) =>
  | EventCreationProps<TEvent>
  | Array<EventCreationProps<TEvent>>
  | Promise<EventCreationProps<TEvent> | Array<EventCreationProps<TEvent>>>

export type CommandDefinition<
  TAggregateState extends AggregateState,
  TCommand extends Command,
  TEvent extends Event,
> = {
  isAuthorized?: (command: TCommand) => boolean | Promise<boolean>
  handle: CommandHandler<TAggregateState, TCommand, TEvent>
}
