import firebase from 'firebase-admin'

import { Aggregate, AggregateState } from './aggregate'
import { ClientInfo } from './misc'

export type EventData = {
  [key: string]: any
} | null

export type EventMetadata = {
  causationId: string
  correlationId: string
  userId: string
  timestamp: firebase.firestore.Timestamp
  revision: number
  client: ClientInfo | null
}

export type Event<
  TProps extends {
    aggregateName: string
    name: string
    data: EventData
  } = {
    aggregateName: string
    name: string
    data: EventData
  },
> = {
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
  TAggregateName extends string,
  TEventCreationProps extends EventCreationProps,
> = Event<{
  aggregateName: TAggregateName
  name: TEventCreationProps['name']
  data: TEventCreationProps['data']
}>

export type EventHandler<TAggregate extends Aggregate, TEvent extends Event> = (
  aggregate: Pick<TAggregate, 'id' | 'state'>,
  event: TEvent,
) => Partial<TAggregate['state']>

export type EventDefinition<
  TAggregateState extends AggregateState,
  TEvent extends Event,
> = {
  handle: EventHandler<Aggregate<TAggregateState>, TEvent>
}
