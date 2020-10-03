import * as testing from '@firebase/rules-unit-testing'
import firebase from 'firebase-admin'

import { config } from '../../example/src/config'
import { ShoppingCartInitialized } from '../../example/src/domain/shopping/cart/events/initialized'
import { State } from '../../example/src/domain/shopping/cart/state'
import { Aggregate } from '../types/aggregate'
import { Event } from '../types/event'
import { AGGREGATES, EVENTS, createEventStore } from './event-store'

const firebaseApp = firebase.initializeApp({
  projectId: config.firebase.projectId,
})

firebaseApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

const eventStore = createEventStore(firebaseApp)

const testData: {
  aggregates: { [id: string]: Aggregate }
  events: { [id: string]: Event }
} = {
  aggregates: {
    E: {
      id: 'E',
      revision: 3,
      state: {},
    },
  },
  events: {
    '1': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'A',
      name: 'initialized',
      id: '1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '1',
        correlationId: '1',
        timestamp: new Date('2020-07-01').getTime(),
        revision: 1,
        client: {
          userId: 'john',
          ip: null,
          ua: null,
          location: null,
        },
      },
    },
    '2': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'B',
      name: 'initialized',
      id: '2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '2',
        correlationId: '2',
        timestamp: new Date('2020-07-02').getTime(),
        revision: 1,
        client: null,
      },
    },
    '3': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'C',
      name: 'initialized',
      id: '3',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '3',
        correlationId: '3',
        timestamp: new Date('2020-07-03').getTime(),
        revision: 1,
        client: {
          userId: 'john',
          ip: null,
          ua: null,
          location: null,
        },
      },
    },
    '4': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'D',
      name: 'initialized',
      id: '4',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '4',
        correlationId: '4',
        timestamp: new Date('2020-07-04').getTime(),
        revision: 1,
        client: null,
      },
    },
    '5': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'initialized',
      id: '5',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        timestamp: new Date('2020-07-05').getTime(),
        revision: 1,
        client: null,
      },
    },
    '5.1': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'itemAdded',
      id: '5.1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        timestamp: new Date('2020-07-05').getTime(),
        revision: 2,
        client: null,
      },
    },
    '5.2': {
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'itemAdded',
      id: '5.2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5.1',
        correlationId: '5',
        timestamp: new Date('2020-07-05').getTime(),
        revision: 3,
        client: null,
      },
    },
  },
}

beforeAll(async () => {
  for (const event of Object.values(testData.events)) {
    await firebaseApp.firestore().collection(EVENTS).doc(event.id).set(event)
  }

  for (const aggregate of Object.values(testData.aggregates)) {
    await firebaseApp
      .firestore()
      .collection(AGGREGATES)
      .doc(aggregate.id)
      .set(aggregate)
  }
})

afterAll(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
  await firebaseApp.delete()
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

  test('saveEvent', async () => {
    const id = await eventStore.saveEvent<ShoppingCartInitialized, State>(
      {
        contextName: 'shopping',
        aggregateName: 'cart',
        aggregateId: 'x',
        name: 'initialized',
        data: null,
        causationId: null,
        correlationId: null,
        client: null,
      },
      (state, event) => ({
        isPlaced: false,
      }),
    )

    expect(await eventStore.getEvent(id)).toEqual({
      contextName: 'shopping',
      aggregateName: 'cart',
      aggregateId: 'x',
      id,
      name: 'initialized',
      data: null,
      metadata: {
        causationId: id,
        correlationId: id,
        timestamp: expect.any(Number),
        revision: 1,
        client: null,
      },
    })
  })

  test('importEvents', async () => {
    const events = Object.values(testData.events)
    await eventStore.importEvents(events)

    for (const event of events) {
      expect(await eventStore.getEvent(event.id)).toEqual(event)
    }
  })

  test('getAggregate', async () => {
    const aggregate = await eventStore.getAggregate(testData.aggregates['E'].id)

    expect(aggregate).toEqual(testData.aggregates['E'])
  })

  test('saveAggregate', async () => {
    await eventStore.saveAggregate({
      id: 'x',
      revision: 7,
      state: {
        foo: 'bar',
      },
    })

    expect(await eventStore.getAggregate('x')).toEqual({
      id: 'x',
      revision: 7,
      state: {
        foo: 'bar',
      },
    })
  })
})
