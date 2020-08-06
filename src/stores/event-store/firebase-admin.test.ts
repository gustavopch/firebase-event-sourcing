import * as testing from '@firebase/testing'
import firebaseAdmin from 'firebase-admin'

import { config } from '../../../example/src/config'
import { EVENTS, SNAPSHOTS } from './constants'
import { createFirebaseAdminEventStore } from './firebase-admin'
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

const firebaseAdminApp = firebaseAdmin.initializeApp({
  projectId: config.firebase.projectId,
})

firebaseAdmin.firestore().settings({
  ignoreUndefinedProperties: true,
})

const eventStore = createFirebaseAdminEventStore(firebaseAdminApp)

const testData = generateTestData(timestamp =>
  firebaseAdmin.firestore.Timestamp.fromDate(new Date(timestamp)),
)

beforeAll(async () => {
  for (const event of Object.values(testData.events)) {
    await firebaseAdminApp
      .firestore()
      .collection(EVENTS)
      .doc(event.id)
      .set(event)
  }

  for (const aggregate of Object.values(testData.aggregates)) {
    await firebaseAdminApp
      .firestore()
      .collection(SNAPSHOTS)
      .doc(aggregate.aggregateId)
      .set(aggregate)
  }
})

afterAll(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
  await firebaseAdminApp.delete()
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
