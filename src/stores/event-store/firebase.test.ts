import * as testing from '@firebase/testing'
import firebase from 'firebase/app'

import { config } from '../../../example/src/config'
import { EVENTS, SNAPSHOTS } from './constants'
import { createFirebaseEventStore } from './firebase'
import {
  generateTestData,
  testEventsByCausationId,
  testGenerateId,
  testGetAggregateSnapshot,
  testGetEvent,
  testGetEventsByCorrelationId,
  testGetEventsByUserId,
  testGetReplay,
  testGetReplayForAggregate,
  testImportEvents,
  testSaveAggregateSnapshot,
  testSaveNewEvent,
} from './shared-tests'

const firebaseApp = testing.initializeTestApp({
  projectId: config.firebase.projectId,
  auth: { uid: 'admin' },
})

// @ts-ignore: https://github.com/firebase/firebase-js-sdk/issues/3354
firebaseApp.firestore()._settings.ignoreUndefinedProperties = true

const eventStore = createFirebaseEventStore(firebaseApp)

const testData = generateTestData(timestamp =>
  firebase.firestore.Timestamp.fromDate(new Date(timestamp)),
)

beforeAll(async () => {
  for (const event of Object.values(testData.events)) {
    await firebaseApp.firestore().collection(EVENTS).doc(event.id).set(event)
  }

  for (const aggregate of Object.values(testData.aggregates)) {
    await firebaseApp
      .firestore()
      .collection(SNAPSHOTS)
      .doc(aggregate.aggregateId)
      .set(aggregate)
  }
})

afterAll(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
  await Promise.all(testing.apps().map(app => app.delete()))
})

describe('Event Store', () => {
  testGenerateId(eventStore)

  testGetEvent(eventStore, testData.events)

  testEventsByCausationId(eventStore, testData.events)

  testGetEventsByCorrelationId(eventStore, testData.events)

  testGetEventsByUserId(eventStore, testData.events)

  testGetReplay(eventStore, testData.events)

  testGetReplayForAggregate(eventStore, testData.events)

  testGetAggregateSnapshot(eventStore, testData.aggregates)

  testSaveNewEvent(eventStore)

  testSaveAggregateSnapshot(eventStore)

  testImportEvents(eventStore, testData.events)
})
