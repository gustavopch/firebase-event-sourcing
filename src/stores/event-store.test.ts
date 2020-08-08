import * as testing from '@firebase/testing'
import firebaseAdmin from 'firebase-admin'

import { config } from '../../example/src/config'
import { ShoppingCartInitialized } from '../../example/src/domain/shopping/cart/events/initialized'
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
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'A',
      name: 'shopping.cart.initialized',
      id: '1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '1',
        correlationId: '1',
        timestamp: new Date('2020-07-01').getTime(),
        revision: 1,
        userId: 'john',
      },
    },
    '2': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'B',
      name: 'shopping.cart.initialized',
      id: '2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '2',
        correlationId: '2',
        timestamp: new Date('2020-07-02').getTime(),
        revision: 1,
      },
    },
    '3': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'C',
      name: 'shopping.cart.initialized',
      id: '3',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '3',
        correlationId: '3',
        timestamp: new Date('2020-07-03').getTime(),
        revision: 1,
        userId: 'john',
      },
    },
    '4': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'D',
      name: 'shopping.cart.initialized',
      id: '4',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '4',
        correlationId: '4',
        timestamp: new Date('2020-07-04').getTime(),
        revision: 1,
      },
    },
    '5': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'shopping.cart.initialized',
      id: '5',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        timestamp: new Date('2020-07-05').getTime(),
        revision: 1,
      },
    },
    '5.1': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'shopping.cart.itemAdded',
      id: '5.1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        timestamp: new Date('2020-07-05').getTime(),
        revision: 2,
      },
    },
    '5.2': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'shopping.cart.itemAdded',
      id: '5.2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5.1',
        correlationId: '5',
        timestamp: new Date('2020-07-05').getTime(),
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
    await eventStore.getReplay('2020-07-03T00:00:00Z', event => {
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
      contextName: 'some',
      aggregateName: 'name',
      aggregateId: 'x',
      name: 'shopping.cart.initialized',
      data: null,
    })

    expect(await eventStore.getEvent(id)).toEqual({
      contextName: 'some',
      aggregateName: 'name',
      aggregateId: 'x',
      id,
      name: 'shopping.cart.initialized',
      data: null,
      metadata: {
        causationId: id,
        correlationId: id,
        timestamp: expect.any(Number),
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
