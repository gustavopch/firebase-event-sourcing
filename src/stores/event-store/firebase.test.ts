import * as testing from '@firebase/testing'
import firebase from 'firebase/app'

import { config } from '../../../example/src/config'
import { EVENTS, SNAPSHOTS } from './constants'
import { createFirebaseEventStore } from './firebase'
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
  testSaveNewEvent,
} from './shared-tests'

const setup: SetupFn = async ({ generateTestData } = {}) => {
  const firebaseApp = testing.initializeTestApp({
    projectId: config.firebase.projectId,
    auth: { uid: 'admin' },
  })

  // @ts-ignore: https://github.com/firebase/firebase-js-sdk/issues/3354
  firebaseApp.firestore()._settings.ignoreUndefinedProperties = true

  const eventStore = createFirebaseEventStore(firebaseApp)

  if (!generateTestData) {
    return {
      eventStore,
      testEvents: {},
      testAggregates: {},
    }
  }

  const { events, aggregates } = generateTestData((timestamp: string) =>
    firebase.firestore.Timestamp.fromDate(new Date(timestamp)),
  )

  for (const event of Object.values(events)) {
    await firebaseApp.firestore().collection(EVENTS).doc(event.id).set(event)
  }

  for (const aggregate of Object.values(aggregates)) {
    await firebaseApp
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
  await Promise.all(testing.apps().map(app => app.delete()))
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

  testSaveNewEvent(setup)

  testSaveAggregateSnapshot(setup)

  testImportEvents(setup)
})
