import { Timestamp, defineView } from '../../../src'
import {
  SHOPPING_CART_INITIALIZED,
  ShoppingCartInitialized,
} from '../domain/shopping/cart/events/initialized'
import {
  SHOPPING_CART_ITEM_ADDED,
  ShoppingCartItemAdded,
} from '../domain/shopping/cart/events/item-added'
import {
  SHOPPING_CART_ITEM_REMOVED,
  ShoppingCartItemRemoved,
} from '../domain/shopping/cart/events/item-removed'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from '../domain/shopping/cart/events/order-placed'

export const CARTS = 'carts'

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

      await store.create(CARTS, event.aggregateId, cart)
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

      await store.update(CARTS, event.aggregateId, nfe)
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

      await store.update(CARTS, event.aggregateId, nfe)
    },

    [SHOPPING_CART_ORDER_PLACED]: async (
      store,
      event: ShoppingCartOrderPlaced,
    ) => {
      const nfe: Partial<Cart> = {
        placedAt: store.values.timestamp(),
        status: 'placed',
      }

      await store.update(CARTS, event.aggregateId, nfe)
    },
  },

  queries: {
    get: (store, id: string): Promise<Cart | null> => {
      return store.get<Cart>(CARTS, id)
    },
  },
})
