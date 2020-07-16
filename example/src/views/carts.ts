import { Timestamp, defineView } from '../../../src'
import {
  SHOPPING_CART_INITIALIZED,
  SHOPPING_CART_ITEM_ADDED,
  SHOPPING_CART_ITEM_REMOVED,
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartInitialized,
  ShoppingCartItemAdded,
  ShoppingCartItemRemoved,
  ShoppingCartOrderPlaced,
} from '../domain/shopping/cart'

const collection = 'carts'

type CartStatus = 'open' | 'placed'

type CartItem = {
  title: string
}

export type Cart = {
  id: string
  initializedAt: Timestamp
  placedAt: Timestamp | null
  status: CartStatus
  items: { [id: string]: CartItem }
}

export const carts = defineView({
  projections: {
    [SHOPPING_CART_INITIALIZED]: async (
      store,
      event: ShoppingCartInitialized,
    ) => {
      const cart: Cart = {
        id: event.aggregateId,
        initializedAt: store.values.timestamp(),
        placedAt: null,
        status: 'open',
        items: {},
      }

      await store.create(collection, event.aggregateId, cart)
    },

    [SHOPPING_CART_ITEM_ADDED]: async (store, event: ShoppingCartItemAdded) => {
      const itemId = store.generateId()

      const nfe: Partial<Cart> = {
        items: {
          [itemId]: {
            title: event.data.title,
          },
        },
      }

      await store.update(collection, event.aggregateId, nfe)
    },

    [SHOPPING_CART_ITEM_REMOVED]: async (
      store,
      event: ShoppingCartItemRemoved,
    ) => {
      const nfe: Partial<Cart> = {
        items: {
          [event.data.itemId]: store.values.delete() as any,
        },
      }

      await store.update(collection, event.aggregateId, nfe)
    },

    [SHOPPING_CART_ORDER_PLACED]: async (
      store,
      event: ShoppingCartOrderPlaced,
    ) => {
      const nfe: Partial<Cart> = {
        placedAt: store.values.timestamp(),
        status: 'placed',
      }

      await store.update(collection, event.aggregateId, nfe)
    },
  },

  queries: {
    get: async (store, id: string): Promise<Cart> => {
      return (await store.get(collection, id)) as Cart
    },
  },
})
