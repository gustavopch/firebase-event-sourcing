import firebase from 'firebase-admin'

import { ViewDefinition, generateId } from '../../../src'

declare global {
  namespace Views.Carts {
    type Status = 'open' | 'placed'

    type Item = {
      title: string
    }

    type Cart = {
      id: string
      initializedAt: number
      placedAt: number | null
      status: Status
      items: { [id: string]: Item }
    }
  }
}

export const carts: ViewDefinition<Views.Carts.Cart> = {
  collectionName: 'carts',

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

    'cart.discarded': (event: Domain.Cart.Discarded) => null,
  },
}
