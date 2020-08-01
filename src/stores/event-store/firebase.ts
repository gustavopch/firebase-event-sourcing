import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import { EVENTS, SNAPSHOTS } from './constants'
import {
  generateId,
  getAggregateSnapshot,
  getEvent,
  getEventsByCausationId,
  getEventsByCorrelationId,
  getEventsByUserId,
  getReplay,
  getReplayForAggregate,
  importEvents,
  markEventAsApproved,
  markEventAsFailed,
  markEventAsRejected,
  saveAggregateSnapshot,
  saveNewEvent,
} from './shared'
import { EventStore } from './types'

export const createFirebaseEventStore = (
  firebaseApp: firebase.app.App,
): EventStore => {
  const db = firebaseApp.firestore()
  const eventsCollection = db.collection(EVENTS)
  const snapshotsCollection = db.collection(SNAPSHOTS)

  return {
    generateId: generateId(eventsCollection),

    getEvent: getEvent(eventsCollection),

    getEventsByCausationId: getEventsByCausationId(eventsCollection),

    getEventsByCorrelationId: getEventsByCorrelationId(eventsCollection),

    getEventsByUserId: getEventsByUserId(eventsCollection),

    getReplay: getReplay(eventsCollection),

    getReplayForAggregate: getReplayForAggregate(eventsCollection),

    getAggregateSnapshot: getAggregateSnapshot(snapshotsCollection),

    saveNewEvent: saveNewEvent(
      eventsCollection,
      firebase.firestore.Timestamp.now,
      firebase.firestore.FieldValue.increment,
      () =>
        // Firebase Emulator Suite currently has no emulator for Firebase Auth, so
        // trying to read 'currentUser' during test will throw an error.
        // Relevant issues:
        // - https://github.com/firebase/firebase-js-sdk/issues/2940
        // - https://github.com/firebase/firebase-tools/issues/1677
        process.env.NODE_ENV === 'test'
          ? undefined
          : firebaseApp.auth().currentUser?.uid,
    ),

    markEventAsApproved: markEventAsApproved(eventsCollection),

    markEventAsRejected: markEventAsRejected(eventsCollection),

    markEventAsFailed: markEventAsFailed(eventsCollection),

    saveAggregateSnapshot: saveAggregateSnapshot(snapshotsCollection),

    importEvents: importEvents(eventsCollection),
  }
}
