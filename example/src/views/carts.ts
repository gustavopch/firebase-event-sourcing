import firebase from 'firebase-admin'

import { ViewDefinition } from '../../../src'
import { flatten } from '../../../src/utils/flatten'
import * as CartEvents from '../domain/cart/events'

export const CARTS = 'carts'

type CartStatus = 'open' | 'placed'

type CartItem = {
  title: string
}

export type Cart = {
  id: string
  initializedAt: number
  placedAt: number | null
  status: CartStatus
  items: { [id: string]: CartItem }
}

export const carts: ViewDefinition = {
  projections: {
    'cart.initialized': async (event: CartEvents.Initialized) => {
      const db = firebase.firestore()

      const cart: Cart = {
        id: event.aggregateId,
        initializedAt: Date.now(),
        placedAt: null,
        status: 'open',
        items: {},
      }

      await db.collection(CARTS).doc(event.aggregateId).set(cart)
    },

    'cart.itemAdded': async (event: CartEvents.ItemAdded) => {
      const db = firebase.firestore()

      const itemId = db.collection('whatever').doc().id

      const nfe: Partial<Cart> = {
        items: {
          [itemId]: {
            title: event.data.title,
          },
        },
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },

    'cart.itemRemoved': async (event: CartEvents.ItemRemoved) => {
      const db = firebase.firestore()

      const nfe: Partial<Cart> = {
        items: {
          [event.data.itemId]: firebase.firestore.FieldValue.delete() as any,
        },
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },

    'cart.orderPlaced': async (event: CartEvents.OrderPlaced) => {
      const db = firebase.firestore()

      const nfe: Partial<Cart> = {
        placedAt: Date.now(),
        status: 'placed',
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },
  },
}
