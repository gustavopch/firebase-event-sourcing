import { Event } from '../../elements/event'
import {
  CollectionReference,
  DocumentSnapshot,
  FieldValue,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Timestamp,
} from '../types'
import { AggregateSnapshot, EventStore, OnEvent } from './types'

const queryInBatches = async (query: Query, onNext: OnEvent) => {
  let lastDocSnap: DocumentSnapshot | undefined = undefined

  while (true) {
    query = query.limit(1000).limit(10000)

    if (lastDocSnap) {
      query = query.startAfter(lastDocSnap)
    }

    const batch: QuerySnapshot = await query.get()

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

export const generateId = (
  someRandomCollection: CollectionReference,
): EventStore['generateId'] => {
  return () => someRandomCollection.doc().id
}

export const getEvent = (
  eventsCollection: CollectionReference,
): EventStore['getEvent'] => {
  return async eventId => {
    if (!eventId) {
      return null
    }

    const docSnap = await eventsCollection.doc(eventId).get()
    return (docSnap.data() ?? null) as Event | null
  }
}

export const getEventsByCausationId = (
  eventsCollection: CollectionReference,
): EventStore['getEventsByCausationId'] => {
  return async causationId => {
    const query = eventsCollection.where('metadata.causationId', '==', causationId) // prettier-ignore

    const querySnap = await query.get()
    const docs = querySnap.docs as QueryDocumentSnapshot[]
    return docs.map(docSnap => docSnap.data() as Event)
  }
}

export const getEventsByCorrelationId = (
  eventsCollection: CollectionReference,
): EventStore['getEventsByCorrelationId'] => {
  return async correlationId => {
    const query = eventsCollection.where('metadata.correlationId', '==', correlationId) // prettier-ignore

    const querySnap = await query.get()
    const docs = querySnap.docs as QueryDocumentSnapshot[]
    return docs.map(docSnap => docSnap.data() as Event)
  }
}

export const getEventsByUserId = (
  eventsCollection: CollectionReference,
): EventStore['getEventsByUserId'] => {
  return async (userId, onNext) => {
    const query = eventsCollection.where('metadata.userId', '==', userId)

    await queryInBatches(query, onNext)
  }
}

export const getReplay = (
  eventsCollection: CollectionReference,
): EventStore['getReplay'] => {
  return async (fromTimestamp, onNext) => {
    const query = eventsCollection.where('metadata.timestamp', '>=', fromTimestamp) // prettier-ignore

    await queryInBatches(query, onNext)
  }
}

export const getReplayForAggregate = (
  eventsCollection: CollectionReference,
): EventStore['getReplayForAggregate'] => {
  return async (aggregateId, fromRevision, onNext) => {
    const query = eventsCollection
      .where('aggregateId', '==', aggregateId)
      .where('metadata.revision', '>=', fromRevision)

    await queryInBatches(query, onNext)
  }
}

export const getAggregateSnapshot = (
  snapshotsCollection: CollectionReference,
): EventStore['getAggregateSnapshot'] => {
  return async aggregateId => {
    if (!aggregateId) {
      return null
    }

    const docSnap = await snapshotsCollection.doc(aggregateId).get()
    return (docSnap.data() ?? null) as AggregateSnapshot | null
  }
}

export const saveNewEvent = (
  eventsCollection: CollectionReference,
  now: () => Timestamp,
  increment: (n: number) => FieldValue,
  currentUserId: () => string | undefined,
): EventStore['saveNewEvent'] => {
  return async ({
    aggregateName,
    aggregateId,
    name,
    data,
    causationId,
    correlationId,
  }) => {
    const eventId = generateId(eventsCollection)()

    const event: Event = {
      aggregateName,
      aggregateId,
      id: eventId,
      name,
      data,
      metadata: {
        causationId: causationId ?? eventId,
        correlationId: correlationId ?? eventId,
        timestamp: now(),
        revision: increment(1) as any,
        userId: currentUserId(),
      },
    }

    await eventsCollection.doc(eventId).set(event)

    return eventId
  }
}

export const saveAggregateSnapshot = (
  snapshotsCollection: CollectionReference,
): EventStore['saveAggregateSnapshot'] => {
  return async aggregate => {
    await snapshotsCollection.doc(aggregate.aggregateId).set(aggregate)
  }
}

export const importEvents = (
  eventsCollection: CollectionReference,
): EventStore['importEvents'] => {
  return async events => {
    for (const event of events) {
      await eventsCollection.doc(event.id).set(event)
    }
  }
}
