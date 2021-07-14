import { AggregateState } from './aggregate'
import { ClientInfo } from './misc'

export type EventData = {
  [key: string]: any
} | null

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: number
  revision: number
  client: ClientInfo | null
}

export type Event<
  TProps extends {
    contextName: string
    aggregateName: string
    name: string
    data: EventData
  } = {
    contextName: string
    aggregateName: string
    name: string
    data: EventData
  },
> = {
  contextName: TProps['contextName']
  aggregateName: TProps['aggregateName']
  aggregateId: string
  id: string
  name: TProps['name']
  data: TProps['data']
  metadata: EventMetadata
}

export type EventCreationProps<TEvent extends Event = Event> =
  TEvent extends any ? Pick<TEvent, 'name' | 'data'> : never

export type EventPreset<
  TContextName extends string,
  TAggregateName extends string,
  TEventCreationProps extends EventCreationProps,
> = Event<{
  contextName: TContextName
  aggregateName: TAggregateName
  name: TEventCreationProps['name']
  data: TEventCreationProps['data']
}>

export type EventHandler<
  TAggregateState extends AggregateState,
  TEvent extends Event,
> = (state: TAggregateState, event: TEvent) => Partial<TAggregateState>

export type EventDefinition<
  TAggregateState extends AggregateState,
  TEvent extends Event,
> = {
  handle: EventHandler<TAggregateState, TEvent>
}
