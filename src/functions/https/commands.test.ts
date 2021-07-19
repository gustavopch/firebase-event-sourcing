import * as testing from '@firebase/rules-unit-testing'
import firebase from 'firebase-admin'
import fetch from 'node-fetch'

import { config } from '../../../example/src/config'
import { cartsCollection } from '../../../example/src/views/carts'
import { createEventStore } from '../../stores/event-store'
import { Event } from '../../types/event'

const firebaseApp = firebase.initializeApp({
  projectId: config.firebase.projectId,
})

firebaseApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

const eventStore = createEventStore(firebaseApp)

afterEach(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
})

afterAll(async () => {
  await Promise.all(testing.apps().map(app => app.delete()))
})

const projectName = process.env.GCLOUD_PROJECT!
const endpoint = `http://localhost:5001/${projectName}/us-central1/commands`

describe('/commands endpoint', () => {
  it.each([
    ['aggregate', 'xxxx', 'initialize'],
    ['command', 'cart', 'xxxxxxxxxx'],
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

  it('returns an error if the command is invalid', async () => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateName: 'cart',
        // 'aggregateId' left out to make the command invalid
        name: 'initialize',
        data: null,
      }),
    })

    expect(res.status).toBe(422)
  })

  it('returns the ID of the new event', async () => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateName: 'cart',
        aggregateId: '123',
        name: 'initialize',
        data: null,
      }),
    })

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      eventIds: [expect.any(String)],
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
        aggregateName: 'cart',
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
        aggregateName: 'cart',
        aggregateId: '123',
        name: 'initialized',
        id: eventId,
        data: null,
        metadata: {
          causationId: eventId,
          correlationId: eventId,
          userId: 'test',
          timestamp: expect.any(firebase.firestore.Timestamp),
          revision: 1,
          client: {
            ip: '127.0.0.1',
            ua: expect.any(String),
            location: null,
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
        aggregateName: 'cart',
        aggregateId: '123',
        name: 'initialize',
        data: null,
      }),
    })

    const cartSnap = await cartsCollection().doc('123').get()

    expect(cartSnap.data()).toEqual({
      id: '123',
      initializedAt: expect.any(Number),
      placedAt: null,
      status: 'open',
      items: {},
    })
  })
})
