import firebase from 'firebase-admin'

import { ViewDefinition, flatten, generateId } from '../../../src'
import * as Domain from '../domain'

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

export const cartsCollection = () => {
  return firebase.firestore().collection('carts')
}

export const carts: ViewDefinition = {
  projections: {
    'cart.initialized': async (event: Domain.Cart.Initialized) => {
      const cart: Cart = {
        id: event.aggregateId,
        initializedAt: event.metadata.timestamp,
        placedAt: null,
        status: 'open',
        items: {},
      }

      await cartsCollection().doc(event.aggregateId).set(cart)
    },

    'cart.itemAdded': async (event: Domain.Cart.ItemAdded) => {
      const nfe: Partial<Cart> = {
        items: {
          [generateId()]: {
            title: event.data.title,
          },
        },
      }

      await cartsCollection().doc(event.aggregateId).update(flatten(nfe))
    },

    'cart.itemRemoved': async (event: Domain.Cart.ItemRemoved) => {
      const nfe: Partial<Cart> = {
        items: {
          [event.data.itemId]: firebase.firestore.FieldValue.delete() as any,
        },
      }

      await cartsCollection().doc(event.aggregateId).update(flatten(nfe))
    },

    'cart.orderPlaced': async (event: Domain.Cart.OrderPlaced) => {
      const nfe: Partial<Cart> = {
        placedAt: event.metadata.timestamp,
        status: 'placed',
      }

      await cartsCollection().doc(event.aggregateId).update(flatten(nfe))
    },
  },
}
