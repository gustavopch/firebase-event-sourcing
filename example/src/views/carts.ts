import firebase from 'firebase-admin'

import { ViewDefinition, generateId } from '../../../src'
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

export const carts: ViewDefinition<Cart> = {
  projections: {
    'cart.initialized': (event: Domain.Cart.Initialized) => ({
      id: event.aggregateId,
      initializedAt: event.metadata.timestamp.toMillis(),
      placedAt: null,
      status: 'open',
      items: {},
    }),

    'cart.itemAdded': (event: Domain.Cart.ItemAdded) => ({
      items: {
        [generateId()]: {
          title: event.data.title,
        },
      },
    }),

    'cart.itemRemoved': (event: Domain.Cart.ItemRemoved) => ({
      items: {
        [event.data.itemId]: firebase.firestore.FieldValue.delete() as any,
      },
    }),

    'cart.orderPlaced': (event: Domain.Cart.OrderPlaced) => ({
      placedAt: event.metadata.timestamp.toMillis(),
      status: 'placed',
    }),
  },
}
