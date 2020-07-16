import firebaseAdmin from 'firebase-admin'

import { EVENTS, SNAPSHOTS } from './constants'
import {
  generateId,
  getAggregateSnapshot,
  getEvent,
  getEventsByCausationId,
  getEventsByCorrelationId,
  getEventsByIssuerId,
  getReplay,
  getReplayForAggregate,
  importEvents,
  saveAggregateSnapshot,
  saveEvent,
} from './shared'
import { EventStore } from './types'

export const createFirebaseAdminEventStore = (
  firebaseAdminApp: firebaseAdmin.app.App,
): EventStore => {
  const db = firebaseAdminApp.firestore()
  const eventsCollection = db.collection(EVENTS)
  const snapshotsCollection = db.collection(SNAPSHOTS)

  return {
    generateId: generateId(eventsCollection),

    getEvent: getEvent(eventsCollection),

    getEventsByCausationId: getEventsByCausationId(eventsCollection),

    getEventsByCorrelationId: getEventsByCorrelationId(eventsCollection),

    getEventsByIssuerId: getEventsByIssuerId(eventsCollection),

    getReplay: getReplay(eventsCollection),

    getReplayForAggregate: getReplayForAggregate(eventsCollection),

    getAggregateSnapshot: getAggregateSnapshot(snapshotsCollection),

    saveEvent: saveEvent(
      eventsCollection,
      firebaseAdmin.firestore.Timestamp.now,
      firebaseAdmin.firestore.FieldValue.increment,
      () => undefined,
    ),

    saveAggregateSnapshot: saveAggregateSnapshot(snapshotsCollection),

    importEvents: importEvents(eventsCollection),
  }
}
