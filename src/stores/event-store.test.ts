import * as testing from '@firebase/rules-unit-testing'
import firebase from 'firebase-admin'

import { config } from '../../example/src/config'
import { AggregateData } from '../types/aggregate'
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
  aggregates: { [id: string]: AggregateData }
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
      aggregateName: 'cart',
      aggregateId: 'A',
      name: 'initialized',
      id: '1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '1',
        correlationId: '1',
        userId: 'john',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-01')), // prettier-ignore
        revision: 1,
        client: null,
      },
    },
    '2': {
      aggregateName: 'cart',
      aggregateId: 'B',
      name: 'initialized',
      id: '2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '2',
        correlationId: '2',
        userId: 'system',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-02')), // prettier-ignore
        revision: 1,
        client: null,
      },
    },
    '3': {
      aggregateName: 'cart',
      aggregateId: 'C',
      name: 'initialized',
      id: '3',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '3',
        correlationId: '3',
        userId: 'john',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-03')), // prettier-ignore
        revision: 1,
        client: null,
      },
    },
    '4': {
      aggregateName: 'cart',
      aggregateId: 'D',
      name: 'initialized',
      id: '4',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '4',
        correlationId: '4',
        userId: 'system',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-04')), // prettier-ignore
        revision: 1,
        client: null,
      },
    },
    '5': {
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'initialized',
      id: '5',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        userId: 'system',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-05')), // prettier-ignore
        revision: 1,
        client: null,
      },
    },
    '5.1': {
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'itemAdded',
      id: '5.1',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5',
        correlationId: '5',
        userId: 'system',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-05')), // prettier-ignore
        revision: 2,
        client: null,
      },
    },
    '5.2': {
      aggregateName: 'cart',
      aggregateId: 'E',
      name: 'itemAdded',
      id: '5.2',
      data: { title: 'Whatever' },
      metadata: {
        causationId: '5.1',
        correlationId: '5',
        userId: 'system',
        timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-05')), // prettier-ignore
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
    const id = await eventStore.saveEvent<
      Domain.Cart.Initialized,
      Domain.Cart.State
    >(
      {
        aggregateName: 'cart',
        aggregateId: 'x',
        name: 'initialized',
        data: null,
        causationId: null,
        correlationId: null,
        userId: 'system',
        client: null,
      },
      {
        isPlaced: false,
      },
      (state, event) => ({
        isPlaced: false,
      }),
    )

    expect(await eventStore.getEvent(id)).toEqual({
      aggregateName: 'cart',
      aggregateId: 'x',
      id,
      name: 'initialized',
      data: null,
      metadata: {
        causationId: id,
        correlationId: id,
        userId: 'system',
        timestamp: expect.any(firebase.firestore.Timestamp),
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

    expect(aggregate).toEqual({
      ...testData.aggregates['E'],
      exists: true,
    })
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
      exists: true,
    })
  })
})
