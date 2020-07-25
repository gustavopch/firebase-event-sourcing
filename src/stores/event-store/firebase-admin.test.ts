import * as testing from '@firebase/testing'
import firebaseAdmin from 'firebase-admin'

import { config } from '../../../example/src/config'
import { EVENTS, SNAPSHOTS } from './constants'
import { createFirebaseAdminEventStore } from './firebase-admin'
import {
  SetupFn,
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
  testSaveEvent,
} from './shared-tests'

const firebaseAdminApp = firebaseAdmin.initializeApp({
  projectId: config.firebase.projectId,
})

firebaseAdmin.firestore().settings({
  ignoreUndefinedProperties: true,
})

const setup: SetupFn = async ({ generateTestData } = {}) => {
  const eventStore = createFirebaseAdminEventStore(firebaseAdminApp)

  if (!generateTestData) {
    return {
      eventStore,
      testEvents: {},
      testAggregates: {},
    }
  }

  const { events, aggregates } = generateTestData((timestamp: string) =>
    firebaseAdmin.firestore.Timestamp.fromDate(new Date(timestamp)),
  )

  for (const event of Object.values(events)) {
    await firebaseAdminApp
      .firestore()
      .collection(EVENTS)
      .doc(event.id)
      .set(event)
  }

  for (const aggregate of Object.values(aggregates)) {
    await firebaseAdminApp
      .firestore()
      .collection(SNAPSHOTS)
      .doc(aggregate.aggregateId)
      .set(aggregate)
  }

  return {
    eventStore,
    testEvents: events,
    testAggregates: aggregates,
  }
}

beforeEach(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
})

afterAll(async () => {
  await firebaseAdminApp.delete()
})

describe('Event Store', () => {
  testGenerateId(setup)

  testGetEvent(setup)

  testEventsByCausationId(setup)

  testGetEventsByCorrelationId(setup)

  testGetEventsByUserId(setup)

  testGetReplay(setup)

  testGetReplayForAggregate(setup)

  testGetAggregateSnapshot(setup)

  testSaveEvent(setup)

  testSaveAggregateSnapshot(setup)

  testImportEvents(setup)
})
