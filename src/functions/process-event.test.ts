import * as testing from '@firebase/testing'
import firebase from 'firebase/app'
import waitForExpect from 'wait-for-expect'

import { initializeApp } from '../../example/src/app'
import { config } from '../../example/src/config'
import {
  SHOPPING_CART,
  SHOPPING_CART_INITIALIZED,
  SHOPPING_CART_ITEM_ADDED,
  ShoppingCartInitialized,
  ShoppingCartItemAdded,
} from '../../example/src/domain/shopping/cart'
import { EVENTS } from '../stores/event-store/constants'

const setup = () => {
  const firebaseApp = testing.initializeTestApp({
    projectId: config.firebase.projectId,
    auth: { uid: 'admin' },
  })

  // @ts-ignore: https://github.com/firebase/firebase-js-sdk/issues/3354
  firebaseApp.firestore()._settings.ignoreUndefinedProperties = true

  const app = initializeApp(firebaseApp)

  return { app, firebaseApp }
}

const aggregateId = 'cart'

const createdEvent: ShoppingCartInitialized = {
  aggregateName: SHOPPING_CART,
  aggregateId,
  name: SHOPPING_CART_INITIALIZED,
  id: 'created',
  data: null,
  metadata: {
    causationId: 'created',
    correlationId: 'created',
    timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-12T12:00:00Z')), // prettier-ignore
    revision: 1,
    status: 'pending',
  },
}

const firstItemAddedEvent: ShoppingCartItemAdded = {
  aggregateName: SHOPPING_CART,
  aggregateId,
  name: SHOPPING_CART_ITEM_ADDED,
  id: 'firstItemAdded',
  data: {
    title: '1st Item',
  },
  metadata: {
    causationId: 'firstItemAdded',
    correlationId: 'firstItemAdded',
    timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-12T12:00:01Z')), // prettier-ignore
    revision: 2,
    status: 'pending',
  },
}

const secondItemAddedEvent: ShoppingCartItemAdded = {
  aggregateName: SHOPPING_CART,
  aggregateId,
  name: SHOPPING_CART_ITEM_ADDED,
  id: 'secondItemAdded',
  data: {
    title: '2nd Item',
  },
  metadata: {
    causationId: 'secondItemAdded',
    correlationId: 'secondItemAdded',
    timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-12T12:00:02Z')), // prettier-ignore
    revision: 3,
    status: 'pending',
  },
}

const thirdItemAddedEvent: ShoppingCartItemAdded = {
  aggregateName: SHOPPING_CART,
  aggregateId,
  name: SHOPPING_CART_ITEM_ADDED,
  id: 'thirdItemAdded',
  data: {
    title: '3rd Item',
  },
  metadata: {
    causationId: 'thirdItemAdded',
    correlationId: 'thirdItemAdded',
    timestamp: firebase.firestore.Timestamp.fromDate(new Date('2020-07-12T12:00:03Z')), // prettier-ignore
    revision: 4,
    status: 'pending',
  },
}

beforeEach(async () => {
  await testing.clearFirestoreData({ projectId: config.firebase.projectId })
})

afterAll(async () => {
  await Promise.all(testing.apps().map(app => app.delete()))
})

it('gracefully handles wrongly ordered function invocations', async () => {
  const { app, firebaseApp } = setup()

  const eventsCollection = firebaseApp.firestore().collection(EVENTS)

  await Promise.all([
    eventsCollection.doc(thirdItemAddedEvent.id).set(thirdItemAddedEvent),
    eventsCollection.doc(secondItemAddedEvent.id).set(secondItemAddedEvent),
    eventsCollection.doc(firstItemAddedEvent.id).set(firstItemAddedEvent),
    eventsCollection.doc(createdEvent.id).set(createdEvent),
  ])

  await waitForExpect(async () => {
    const cart = await app.views.carts.get(aggregateId)

    expect(
      Object.values(cart.items).sort((a, b) => a.title.localeCompare(b.title)),
    ).toEqual([
      { title: '1st Item' },
      { title: '2nd Item' },
      { title: '3rd Item' },
    ])
  })
})
