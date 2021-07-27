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

export const carts: ViewDefinition<
  Views.Carts.Cart,
  | Domain.Cart.Initialized
  | Domain.Cart.ItemAdded
  | Domain.Cart.ItemRemoved
  | Domain.Cart.OrderPlaced
  | Domain.Cart.Discarded
> = {
  collectionName: 'carts',

  projections: {
    'cart.initialized': event => ({
      id: event.aggregateId,
      initializedAt: event.metadata.timestamp.toMillis(),
      placedAt: null,
      status: 'open',
      items: {},
    }),

    'cart.itemAdded': event => ({
      items: {
        [generateId()]: {
          title: event.data.title,
        },
      },
    }),

    'cart.itemRemoved': event => ({
      items: {
        [event.data.itemId]: firebase.firestore.FieldValue.delete() as any,
      },
    }),

    'cart.orderPlaced': event => ({
      placedAt: event.metadata.timestamp.toMillis(),
      status: 'placed',
    }),

    'cart.discarded': event => null,
  },
}
