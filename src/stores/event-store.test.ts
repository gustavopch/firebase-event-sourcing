import * as testing from '@firebase/testing'
import firebaseAdmin from 'firebase-admin'

import { config } from '../../example/src/config'
import { SHOPPING_CART } from '../../example/src/domain/shopping/cart'
import {
  SHOPPING_CART_INITIALIZED,
  ShoppingCartInitialized,
} from '../../example/src/domain/shopping/cart/events/initialized'
import { SHOPPING_CART_ITEM_ADDED } from '../../example/src/domain/shopping/cart/events/item-added'
import { Event } from '../elements/event'
import { EVENTS, SNAPSHOTS, createEventStore } from './event-store'

const firebaseAdminApp = firebaseAdmin.initializeApp({
  projectId: config.firebase.projectId,
})

firebaseAdminApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

const eventStore = createEventStore(firebaseAdminApp)

const testData = {
  events: {
    '1': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'A',
      name: SHOPPING_CART_INITIALIZED,
      id: '1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '1',
        correlationId: '1',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-01')), // prettier-ignore
        revision: 1,
        userId: 'john',
      },
    },
    '2': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'B',
      name: SHOPPING_CART_INITIALIZED,
      id: '2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '2',
        correlationId: '2',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-02')), // prettier-ignore
        revision: 1,
      },
    },
    '3': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'C',
      name: SHOPPING_CART_INITIALIZED,
      id: '3',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '3',
        correlationId: '3',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-03')), // prettier-ignore
        revision: 1,
        userId: 'john',
      },
    },
    '4': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'D',
      name: SHOPPING_CART_INITIALIZED,
      id: '4',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '4',
        correlationId: '4',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-04')), // prettier-ignore
        revision: 1,
      },
    },
    '5': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'E',
      name: SHOPPING_CART_INITIALIZED,
      id: '5',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-05')), // prettier-ignore
        revision: 1,
      },
    },
    '5.1': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'E',
      name: SHOPPING_CART_ITEM_ADDED,
      id: '5.1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-05')), // prettier-ignore
        revision: 2,
      },
    },
    '5.2': {
      aggregateName: SHOPPING_CART,
      aggregateId: 'E',
      name: SHOPPING_CART_ITEM_ADDED,
      id: '5.2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5.1',
        correlationId: '5',
        timestamp: firebaseAdmin.firestore.Timestamp.fromDate(new Date('2020-07-05')), // prettier-ignore
        revision: 3,
      },
    },
  },
  aggregates: {
    E: {
      aggregateId: 'E',
      revision: 3,
    },
  },
}

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
  test('generateId', () => {
    const id = eventStore.generateId()
    expect(typeof id).toBe('string')
  })

  test('getEvent', async () => {
    expect(await eventStore.getEvent('1')).toEqual(testData.events['1'])
  })

  test('getEventsByCausationId', async () => {
    expect(await eventStore.getEventsByCausationId('1')).toEqual([
      testData.events['1'],
    ])

    expect(await eventStore.getEventsByCausationId('5.1')).toEqual([
      testData.events['5.2'],
    ])
  })

  test('getEventsByCorrelationId', async () => {
    expect(await eventStore.getEventsByCorrelationId('1')).toEqual([
      testData.events['1'],
    ])

    expect(await eventStore.getEventsByCorrelationId('5')).toEqual([
      testData.events['5'],
      testData.events['5.1'],
      testData.events['5.2'],
    ])
  })

  test('getEventsByUserId', async () => {
    const events: Event[] = []
    await eventStore.getEventsByUserId('john', event => {
      events.push(event)
    })

    expect(events).toEqual([testData.events['1'], testData.events['3']])
  })

  test('getReplay', async () => {
    const events: Event[] = []
    await eventStore.getReplay(new Date('2020-07-03T00:00:00Z'), event => {
      events.push(event)
    })

    expect(events).toEqual([
      testData.events['3'],
      testData.events['4'],
      testData.events['5'],
      testData.events['5.1'],
      testData.events['5.2'],
    ])
  })

  test('getReplayForAggregate', async () => {
    const events: Event[] = []
    await eventStore.getReplayForAggregate('E', 2, event => {
      events.push(event)
    })

    expect(events).toEqual([testData.events['5.1'], testData.events['5.2']])
  })

  test('getAggregateSnapshot', async () => {
    const aggregate = await eventStore.getAggregateSnapshot(
      testData.aggregates['E'].aggregateId,
    )

    expect(aggregate).toEqual(testData.aggregates['E'])
  })

  test('saveNewEvent', async () => {
    const id = await eventStore.saveNewEvent<ShoppingCartInitialized>({
      aggregateName: 'some.name',
      aggregateId: 'x',
      name: SHOPPING_CART_INITIALIZED,
      data: null,
    })

    expect(await eventStore.getEvent(id)).toEqual({
      aggregateName: 'some.name',
      aggregateId: 'x',
      id,
      name: SHOPPING_CART_INITIALIZED,
      data: null,
      metadata: {
        causationId: id,
        correlationId: id,
        timestamp: expect.any(firebaseAdmin.firestore.Timestamp),
        revision: 1,
      },
    })
  })

  test('saveAggregateSnapshot', async () => {
    await eventStore.saveAggregateSnapshot({
      aggregateId: 'x',
      revision: 7,
    })

    expect(await eventStore.getAggregateSnapshot('x')).toEqual({
      aggregateId: 'x',
      revision: 7,
    })
  })

  test('importEvents', async () => {
    const events = Object.values(testData.events)
    await eventStore.importEvents(events)

    for (const event of events) {
      expect(await eventStore.getEvent(event.id)).toEqual(event)
    }
  })
})
