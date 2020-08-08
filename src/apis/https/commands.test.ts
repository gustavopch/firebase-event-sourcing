import * as testing from '@firebase/testing'
import firebaseAdmin from 'firebase-admin'
import fetch from 'node-fetch'

import { config } from '../../../example/src/config'
import { SHOPPING_CART } from '../../../example/src/domain/shopping/cart'
import { SHOPPING_CART_INITIALIZED } from '../../../example/src/domain/shopping/cart/events/initialized'
import { CARTS } from '../../../example/src/views/carts'
import { Event } from '../../elements/event'
import { createEventStore } from '../../stores/event-store'

const firebaseAdminApp = firebaseAdmin.initializeApp({
  projectId: config.firebase.projectId,
})

firebaseAdminApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

const db = firebaseAdminApp.firestore()

const eventStore = createEventStore(firebaseAdminApp)

afterEach(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
})

afterAll(async () => {
  await Promise.all(testing.apps().map(app => app.delete()))
})

const projectName = process.env.GCLOUD_PROJECT!
const endpoint = `http://localhost:5001/${projectName}/us-central1/commands`

describe('/commands endpoint', () => {
  it.each(['DELETE', 'GET', 'HEAD', 'PATCH', 'PUT'])(
    'rejects method %s',
    async method => {
      const res = await fetch(endpoint, {
        method,
      })

      expect(res.status).toBe(405)
    },
  )

  it.each([
    ['context', 'xxxxxxxx.cart', 'initialize'],
    ['aggregate', 'shopping.xxxx', 'initialize'],
    ['command', 'shopping.cart', 'xxxxxxxxxx'],
  ])(
    'gracefully fails when %s is not found',
    async (_, aggregateName, commandName) => {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateName,
          aggregateId: '123',
          name: commandName,
          data: null,
        }),
      })

      expect(res.status).toBe(422)
    },
  )

  it('returns the ID of the new event', async () => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateName: SHOPPING_CART,
        aggregateId: '123',
        name: 'initialize',
        data: null,
      }),
    })

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      eventId: expect.any(String),
    })
  })

  it('saves the new event into Firestore', async () => {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '127.0.0.1',
      },
      body: JSON.stringify({
        aggregateName: SHOPPING_CART,
        aggregateId: '123',
        name: 'initialize',
        data: null,
      }),
    })

    const events: Event[] = []
    await eventStore.getReplayForAggregate('123', 0, event => {
      events.push(event)
    })

    const eventId = events[0].id

    expect(events).toEqual([
      {
        aggregateName: SHOPPING_CART,
        aggregateId: '123',
        name: SHOPPING_CART_INITIALIZED,
        id: eventId,
        data: null,
        metadata: {
          causationId: eventId,
          correlationId: eventId,
          timestamp: expect.any(Number),
          revision: 1,
          userId: 'test',
          ip: '127.0.0.1',
          userAgent: expect.any(String),
          location: {
            city: expect.any(String),
            region: expect.any(String),
            country: expect.any(String),
            latitude: expect.any(Number),
            longitude: expect.any(Number),
          },
        },
      },
    ])
  })

  it('updates the projections', async () => {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateName: SHOPPING_CART,
        aggregateId: '123',
        name: 'initialize',
        data: null,
      }),
    })

    const cartSnap = await db.collection(CARTS).doc('123').get()

    expect(cartSnap.data()).toEqual({
      id: '123',
      initializedAt: expect.any(Number),
      placedAt: null,
      status: 'open',
      items: {},
    })
  })
})
