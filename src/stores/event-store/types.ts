import { Event } from '../../elements/event'
import { EventStatus } from '../../elements/event-metadata'

export type OnEvent = (event: Event) => void | Promise<void>

export type AggregateSnapshot = {
  aggregateId: string
  revision: number
}

export type EventStore = {
  generateId: () => string

  getEvent: (eventId: string | null | undefined) => Promise<Event | null>

  getEventsByCausationId: (
    causationId: string,
    options?: { status?: EventStatus },
  ) => Promise<Event[]>

  getEventsByCorrelationId: (
    correlationId: string,
    options?: { status?: EventStatus },
  ) => Promise<Event[]>

  getEventsByUserId: (
    userId: string,
    onNext: OnEvent,
    options?: { status?: EventStatus },
  ) => Promise<void>

  getReplay: (
    fromTimestamp: Date,
    onNext: OnEvent,
    options?: { status?: EventStatus },
  ) => Promise<void>

  getReplayForAggregate: (
    aggregateId: string,
    fromRevision: number,
    onNext: OnEvent,
    options?: { status?: EventStatus },
  ) => Promise<void>

  getAggregateSnapshot: (
    aggregateId: string | null | undefined,
  ) => Promise<AggregateSnapshot | null>

  saveNewEvent: <TEvent extends Event>(eventProps: {
    aggregateName: TEvent['aggregateName']
    aggregateId: TEvent['aggregateId']
    name: TEvent['name']
    data: TEvent['data']
    causationId?: string
    correlationId?: string
  }) => Promise<Event>

  saveAggregateSnapshot: (aggregate: AggregateSnapshot) => Promise<void>

  importEvents: (events: Event[]) => Promise<void>
}
