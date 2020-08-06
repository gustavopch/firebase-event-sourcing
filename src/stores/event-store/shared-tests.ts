import waitForExpect from 'wait-for-expect'
import { SHOPPING_CART } from '../../../example/src/domain/shopping/cart'
import {
  SHOPPING_CART_INITIALIZED,
  ShoppingCartInitialized,
} from '../../../example/src/domain/shopping/cart/events/initialized'
import { SHOPPING_CART_ITEM_ADDED } from '../../../example/src/domain/shopping/cart/events/item-added'
import { Event } from '../../elements/event'
import { Timestamp } from '../types'
import { AggregateSnapshot, EventStore } from './types'

export const generateTestData = (
  timestamp: (timestamp: string) => Timestamp,
): {
  events: { [id: string]: Event }
  aggregates: { [id: string]: AggregateSnapshot }
} => ({
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
        timestamp: timestamp('2020-07-01'),
        revision: 1,
        status: 'approved',
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
        timestamp: timestamp('2020-07-02'),
        revision: 1,
        status: 'approved',
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
        timestamp: timestamp('2020-07-03'),
        revision: 1,
        status: 'approved',
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
        timestamp: timestamp('2020-07-04'),
        revision: 1,
        status: 'approved',
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
        timestamp: timestamp('2020-07-05'),
        revision: 1,
        status: 'approved',
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
        timestamp: timestamp('2020-07-05'),
        revision: 2,
        status: 'approved',
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
        timestamp: timestamp('2020-07-05'),
        revision: 3,
        status: 'approved',
      },
    },
  },
  aggregates: {
    E: {
      aggregateId: 'E',
      revision: 3,
    },
  },
})

export const testGenerateId = (eventStore: EventStore): void => {
  test('generateId', () => {
    const id = eventStore.generateId()
    expect(typeof id).toBe('string')
  })
}

export const testGetEvent = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('getEvent', async () => {
    expect(await eventStore.getEvent('1')).toEqual(testEvents['1'])
  })
}

export const testEventsByCausationId = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('getEventsByCausationId', async () => {
    expect(await eventStore.getEventsByCausationId('1')).toEqual([
      testEvents['1'],
    ])

    expect(await eventStore.getEventsByCausationId('5.1')).toEqual([
      testEvents['5.2'],
    ])
  })
}

export const testGetEventsByCorrelationId = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('getEventsByCorrelationId', async () => {
    expect(await eventStore.getEventsByCorrelationId('1')).toEqual([
      testEvents['1'],
    ])

    expect(await eventStore.getEventsByCorrelationId('5')).toEqual([
      testEvents['5'],
      testEvents['5.1'],
      testEvents['5.2'],
    ])
  })
}

export const testGetEventsByUserId = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('getEventsByUserId', async () => {
    const events: Event[] = []
    await eventStore.getEventsByUserId('john', event => {
      events.push(event)
    })

    expect(events).toEqual([testEvents['1'], testEvents['3']])
  })
}

export const testGetReplay = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('getReplay', async () => {
    const events: Event[] = []
    await eventStore.getReplay(new Date('2020-07-03T00:00:00Z'), event => {
      events.push(event)
    })

    expect(events).toEqual([
      testEvents['3'],
      testEvents['4'],
      testEvents['5'],
      testEvents['5.1'],
      testEvents['5.2'],
    ])
  })
}

export const testGetReplayForAggregate = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('getReplayForAggregate', async () => {
    const events: Event[] = []
    await eventStore.getReplayForAggregate('E', 2, event => {
      events.push(event)
    })

    expect(events).toEqual([testEvents['5.1'], testEvents['5.2']])
  })
}

export const testGetAggregateSnapshot = (
  eventStore: EventStore,
  testAggregates: { [id: string]: AggregateSnapshot },
): void => {
  test('getAggregateSnapshot', async () => {
    const aggregate = await eventStore.getAggregateSnapshot(
      testAggregates['E'].aggregateId,
    )

    expect(aggregate).toEqual(testAggregates['E'])
  })
}

export const testSaveNewEvent = (eventStore: EventStore): void => {
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
        timestamp: expect.objectContaining({ seconds: expect.anything() }), // Duck type: firebase.firestore.Timestamp
        revision: 1,
        status: 'pending',
      },
    })

    await waitForExpect(async () => {
      expect((await eventStore.getEvent(id))?.metadata.status).toBe('approved')
    })
  })
}

export const testMarkEventAsX = (eventStore: EventStore): void => {
  test('markEventAs{Approved,Rejected,Failed}', async () => {
    let event = (await eventStore.getEvent('1'))!

    await eventStore.markEventAsRejected(event)
    event = (await eventStore.getEvent('1'))!
    expect(event.metadata.status).toBe('rejected')

    await eventStore.markEventAsFailed(event)
    event = (await eventStore.getEvent('1'))!
    expect(event.metadata.status).toBe('failed')

    await eventStore.markEventAsApproved(event)
    event = (await eventStore.getEvent('1'))!
    expect(event.metadata.status).toBe('approved')
  })
}

export const testSaveAggregateSnapshot = (eventStore: EventStore): void => {
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
}

export const testImportEvents = (
  eventStore: EventStore,
  testEvents: { [id: string]: Event },
): void => {
  test('importEvents', async () => {
    const events = Object.values(testEvents)
    await eventStore.importEvents(events)

    for (const event of events) {
      expect(await eventStore.getEvent(event.id)).toEqual(event)
    }
  })
}
