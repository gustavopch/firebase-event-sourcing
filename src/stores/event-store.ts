import firebase from 'firebase-admin'

import { Aggregate, AggregateData, AggregateState } from '../types/aggregate'
import { Event } from '../types/event'
import { ClientInfo } from '../types/misc'
import { generateId } from '../utils/generate-id'

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

export type OnEvent = (event: Event) => Promisable<void>

export type EventStore = ReturnType<typeof createEventStore>

export const createEventStore = (firebaseApp: firebase.app.App) => {
  const db = firebaseApp.firestore()
  const aggregatesCollection = db.collection(AGGREGATES)
  const eventsCollection = db.collection(EVENTS)

  return {
    getEvent: async (
      eventId: string | null | undefined,
    ): Promise<Event | null> => {
      if (!eventId) {
        return null
      }

      const docSnap = await eventsCollection.doc(eventId).get()
      return (docSnap.data() ?? null) as Event | null
    },

    getEventsByCausationId: async (causationId: string): Promise<Event[]> => {
      const query = eventsCollection.where('metadata.causationId', '==', causationId) // prettier-ignore

      const querySnap = await query.get()
      return querySnap.docs.map(docSnap => docSnap.data() as Event)
    },

    getEventsByCorrelationId: async (
      correlationId: string,
    ): Promise<Event[]> => {
      const query = eventsCollection.where('metadata.correlationId', '==', correlationId) // prettier-ignore

      const querySnap = await query.get()
      return querySnap.docs.map(docSnap => docSnap.data() as Event)
    },

    getEventsByUserId: async (
      userId: string,
      onNext: OnEvent,
    ): Promise<void> => {
      const query = eventsCollection.where('metadata.userId', '==', userId)

      await queryInBatches(query, onNext)
    },

    getReplay: async (
      fromTimestamp: firebase.firestore.Timestamp | Date | string | number,
      onNext: OnEvent,
    ): Promise<void> => {
      const query = eventsCollection.where(
        'metadata.timestamp',
        '>=',
        fromTimestamp instanceof firebase.firestore.Timestamp
          ? fromTimestamp
          : new Date(fromTimestamp),
      )

      await queryInBatches(query, onNext)
    },

    getReplayForAggregate: async (
      aggregateId: string,
      fromRevision: number,
      onNext: OnEvent,
    ): Promise<void> => {
      const query = eventsCollection
        .where('aggregateId', '==', aggregateId)
        .where('metadata.revision', '>=', fromRevision)

      await queryInBatches(query, onNext)
    },

    saveEvent: async <
      TEvent extends Event,
      TAggregateState extends AggregateState,
    >(
      {
        aggregateName,
        aggregateId,
        name,
        data,
        causationId,
        correlationId,
        userId,
        client,
      }: {
        aggregateName: TEvent['aggregateName']
        aggregateId: TEvent['aggregateId']
        name: TEvent['name']
        data: TEvent['data']
        causationId: string | null
        correlationId: string | null
        userId: string
        client: ClientInfo | null
      },
      initialState: TAggregateState,
      getNewState: (state: TAggregateState, event: Event) => TAggregateState,
    ): Promise<string> => {
      const eventId = generateId()

      const aggregateRef = aggregatesCollection.doc(aggregateId)
      const eventRef = eventsCollection.doc(eventId)

      await db.runTransaction(async transaction => {
        const oldAggregate = await transaction
          .get(aggregateRef)
          .then(docSnap => {
            const existingAggregate = docSnap.data() as
              | AggregateData
              | undefined

            if (existingAggregate) {
              return existingAggregate
            }

            return {
              id: aggregateId,
              revision: 0,
              state: initialState,
            }
          })

        const newRevision = oldAggregate.revision + 1

        const event: Event = {
          aggregateName,
          aggregateId,
          id: eventId,
          name,
          data,
          metadata: {
            causationId: causationId ?? eventId,
            correlationId: correlationId ?? eventId,
            userId,
            timestamp: firebase.firestore.Timestamp.now(),
            revision: newRevision,
            client,
          },
        }

        transaction.set(eventRef, event)

        const newAggregate: AggregateData = {
          id: aggregateId,
          revision: newRevision,
          state: getNewState(oldAggregate.state as any, event),
        }

        transaction.set(aggregateRef, newAggregate)
      })

      return eventId
    },

    importEvents: async (events: Event[]): Promise<void> => {
      for (const event of events) {
        await eventsCollection.doc(event.id).set(event)
      }
    },

    getAggregate: async (
      aggregateId: string | null | undefined,
    ): Promise<Aggregate | null> => {
      if (!aggregateId) {
        return null
      }

      const aggregate = await aggregatesCollection
        .doc(aggregateId)
        .get()
        .then(snap => snap.data() as AggregateData | undefined)

      return aggregate ? { ...aggregate, exists: true } : null
    },

    saveAggregate: async (aggregate: AggregateData): Promise<void> => {
      await aggregatesCollection.doc(aggregate.id).set(aggregate)
    },
  }
}
