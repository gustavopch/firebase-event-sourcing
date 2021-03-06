import firebase from 'firebase-admin'

import { ViewDefinition } from '../../../src'
import { flatten } from '../../../src/utils/flatten'
import * as ShoppingCart from '../domain/shopping/cart/events'

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
    'shopping.cart.initialized': async (event: ShoppingCart.Initialized) => {
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

    'shopping.cart.itemAdded': async (event: ShoppingCart.ItemAdded) => {
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

    'shopping.cart.itemRemoved': async (event: ShoppingCart.ItemRemoved) => {
      const db = firebase.firestore()

      const nfe: Partial<Cart> = {
        items: {
          [event.data.itemId]: firebase.firestore.FieldValue.delete() as any,
        },
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },

    'shopping.cart.orderPlaced': async (event: ShoppingCart.OrderPlaced) => {
      const db = firebase.firestore()

      const nfe: Partial<Cart> = {
        placedAt: Date.now(),
        status: 'placed',
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },
  },
}
