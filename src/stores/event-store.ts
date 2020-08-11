import firebaseAdmin from 'firebase-admin'

import { ClientInfo } from '../elements/client-info'
import { Event } from '../elements/event'
import { State } from '../elements/state'

export const EVENTS = 'events'
export const SNAPSHOTS = 'snapshots'

const queryInBatches = async (
  query: firebaseAdmin.firestore.Query,
  onNext: OnEvent,
) => {
  let lastDocSnap:
    | firebaseAdmin.firestore.DocumentSnapshot
    | undefined = undefined

  while (true) {
    query = query.limit(1000).limit(10000)

    if (lastDocSnap) {
      query = query.startAfter(lastDocSnap)
    }

    const batch: firebaseAdmin.firestore.QuerySnapshot = await query.get()

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

export type Snapshot<TState extends State = State> = {
  aggregateId: string
  revision: number
  state: TState
}

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

  saveEvent: <TEvent extends Event, TState extends State>(
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
    getSnapshotState: (event: Event) => TState,
  ) => Promise<string>

  importEvents: (events: Event[]) => Promise<void>

  getSnapshot: (
    aggregateId: string | null | undefined,
  ) => Promise<Snapshot | null>

  saveSnapshot: (snapshot: Snapshot) => Promise<void>
}

export const createEventStore = (
  firebaseAdminApp: firebaseAdmin.app.App,
): EventStore => {
  const db = firebaseAdminApp.firestore()
  const eventsCollection = db.collection(EVENTS)
  const snapshotsCollection = db.collection(SNAPSHOTS)

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
      getSnapshotState,
    ) => {
      const eventId = generateId()

      const snapshotRef = snapshotsCollection.doc(aggregateId)
      const eventRef = eventsCollection.doc(eventId)

      await db.runTransaction(async transaction => {
        const oldSnapshot = await transaction.get(snapshotRef).then(docSnap => {
          const existingSnapshot = docSnap.data() as Snapshot | undefined

          if (existingSnapshot) {
            return existingSnapshot
          }

          return {
            aggregateId,
            revision: 0,
            state: {},
          }
        })

        const newRevision = oldSnapshot.revision + 1

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

        const newSnapshot: Snapshot = {
          aggregateId,
          revision: newRevision,
          state: getSnapshotState(event),
        }

        transaction.set(snapshotRef, newSnapshot)
      })

      return eventId
    },

    importEvents: async events => {
      for (const event of events) {
        await eventsCollection.doc(event.id).set(event)
      }
    },

    getSnapshot: async aggregateId => {
      if (!aggregateId) {
        return null
      }

      const docSnap = await snapshotsCollection.doc(aggregateId).get()
      return (docSnap.data() ?? null) as Snapshot | null
    },

    saveSnapshot: async aggregate => {
      await snapshotsCollection.doc(aggregate.aggregateId).set(aggregate)
    },
  }
}
