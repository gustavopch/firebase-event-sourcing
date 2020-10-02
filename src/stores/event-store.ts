import firebase from 'firebase-admin'

import { Aggregate, AggregateState } from '../types/aggregate'
import { Event } from '../types/event'
import { ClientInfo } from '../types/misc'

export const AGGREGATES = 'aggregates'
export const EVENTS = 'events'

const queryInBatches = async (
  query: firebase.firestore.Query,
  onNext: OnEvent,
) => {
  let lastDocSnap: firebase.firestore.DocumentSnapshot | undefined = undefined

  while (true) {
    query = query.limit(1000).limit(10000)

    if (lastDocSnap) {
      query = query.startAfter(lastDocSnap)
    }

    const batch: firebase.firestore.QuerySnapshot = await query.get()

    lastDocSnap = batch.docs[batch.size - 1]
    if (batch.empty) {
      return
    }

    for (const docSnap of batch.docs) {
      const event = docSnap.data() as Event
      await onNext(event)
    }
  }
}

export type OnEvent = (event: Event) => void | Promise<void>

export type EventStore = {
  generateId: () => string

  getEvent: (eventId: string | null | undefined) => Promise<Event | null>

  getEventsByCausationId: (causationId: string) => Promise<Event[]>

  getEventsByCorrelationId: (correlationId: string) => Promise<Event[]>

  getEventsByUserId: (userId: string, onNext: OnEvent) => Promise<void>

  getReplay: (
    fromTimestamp: Date | string | number,
    onNext: OnEvent,
  ) => Promise<void>

  getReplayForAggregate: (
    aggregateId: string,
    fromRevision: number,
    onNext: OnEvent,
  ) => Promise<void>

  saveEvent: <TEvent extends Event, TAggregateState extends AggregateState>(
    eventProps: {
      contextName: TEvent['contextName']
      aggregateName: TEvent['aggregateName']
      aggregateId: TEvent['aggregateId']
      name: TEvent['name']
      data: TEvent['data']
      causationId: string | null
      correlationId: string | null
      client: ClientInfo | null
    },
    getAggregateState: (event: Event) => TAggregateState,
  ) => Promise<string>

  importEvents: (events: Event[]) => Promise<void>

  getAggregate: (
    aggregateId: string | null | undefined,
  ) => Promise<Aggregate | null>

  saveAggregate: (aggregate: Aggregate) => Promise<void>
}

export const createEventStore = (firebaseApp: firebase.app.App): EventStore => {
  const db = firebaseApp.firestore()
  const aggregatesCollection = db.collection(AGGREGATES)
  const eventsCollection = db.collection(EVENTS)

  const generateId = () => {
    return db.collection('whatever').doc().id
  }

  return {
    generateId,

    getEvent: async eventId => {
      if (!eventId) {
        return null
      }

      const docSnap = await eventsCollection.doc(eventId).get()
      return (docSnap.data() ?? null) as Event | null
    },

    getEventsByCausationId: async causationId => {
      const query = eventsCollection.where('metadata.causationId', '==', causationId) // prettier-ignore

      const querySnap = await query.get()
      return querySnap.docs.map(docSnap => docSnap.data() as Event)
    },

    getEventsByCorrelationId: async correlationId => {
      const query = eventsCollection.where('metadata.correlationId', '==', correlationId) // prettier-ignore

      const querySnap = await query.get()
      return querySnap.docs.map(docSnap => docSnap.data() as Event)
    },

    getEventsByUserId: async (userId, onNext) => {
      const query = eventsCollection.where(
        'metadata.client.userId',
        '==',
        userId,
      )

      await queryInBatches(query, onNext)
    },

    getReplay: async (fromTimestamp, onNext) => {
      fromTimestamp = new Date(fromTimestamp)

      const query = eventsCollection.where('metadata.timestamp', '>=', fromTimestamp.getTime()) // prettier-ignore

      await queryInBatches(query, onNext)
    },

    getReplayForAggregate: async (aggregateId, fromRevision, onNext) => {
      const query = eventsCollection
        .where('aggregateId', '==', aggregateId)
        .where('metadata.revision', '>=', fromRevision)

      await queryInBatches(query, onNext)
    },

    saveEvent: async (
      {
        contextName,
        aggregateName,
        aggregateId,
        name,
        data,
        causationId,
        correlationId,
        client,
      },
      getAggregateState,
    ) => {
      const eventId = generateId()

      const aggregateRef = aggregatesCollection.doc(aggregateId)
      const eventRef = eventsCollection.doc(eventId)

      await db.runTransaction(async transaction => {
        const oldAggregate = await transaction
          .get(aggregateRef)
          .then(docSnap => {
            const existingAggregate = docSnap.data() as Aggregate | undefined

            if (existingAggregate) {
              return existingAggregate
            }

            return {
              id: aggregateId,
              revision: 0,
              state: {},
            }
          })

        const newRevision = oldAggregate.revision + 1

        const event: Event = {
          contextName,
          aggregateName,
          aggregateId,
          id: eventId,
          name,
          data,
          metadata: {
            causationId: causationId ?? eventId,
            correlationId: correlationId ?? eventId,
            timestamp: Date.now(),
            revision: newRevision,
            client,
          },
        }

        transaction.set(eventRef, event)

        const newAggregate: Aggregate = {
          id: aggregateId,
          revision: newRevision,
          state: getAggregateState(event),
        }

        transaction.set(aggregateRef, newAggregate)
      })

      return eventId
    },

    importEvents: async events => {
      for (const event of events) {
        await eventsCollection.doc(event.id).set(event)
      }
    },

    getAggregate: async aggregateId => {
      if (!aggregateId) {
        return null
      }

      const docSnap = await aggregatesCollection.doc(aggregateId).get()
      return (docSnap.data() ?? null) as Aggregate | null
    },

    saveAggregate: async aggregate => {
      await aggregatesCollection.doc(aggregate.id).set(aggregate)
    },
  }
}
