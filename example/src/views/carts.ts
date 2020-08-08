import firebaseAdmin from 'firebase-admin'

import { defineView } from '../../../src'
import { flatten } from '../../../src/utils/flatten'
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
  initializedAt: number
  placedAt: number | null
  status: CartStatus
  items: { [id: string]: CartItem }
}

export const carts = defineView({
  projections: {
    [SHOPPING_CART_INITIALIZED]: async (event: ShoppingCartInitialized) => {
      const db = firebaseAdmin.firestore()

      const cart: Cart = {
        id: event.aggregateId,
        initializedAt: Date.now(),
        placedAt: null,
        status: 'open',
        items: {},
      }

      await db.collection(CARTS).doc(event.aggregateId).set(cart)
    },

    [SHOPPING_CART_ITEM_ADDED]: async (event: ShoppingCartItemAdded) => {
      const db = firebaseAdmin.firestore()

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

    [SHOPPING_CART_ITEM_REMOVED]: async (event: ShoppingCartItemRemoved) => {
      const db = firebaseAdmin.firestore()

      const nfe: Partial<Cart> = {
        items: {
          [event.data.itemId]: firebaseAdmin.firestore.FieldValue.delete() as any // prettier-ignore
        },
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },

    [SHOPPING_CART_ORDER_PLACED]: async (event: ShoppingCartOrderPlaced) => {
      const db = firebaseAdmin.firestore()

      const nfe: Partial<Cart> = {
        placedAt: Date.now(),
        status: 'placed',
      }

      await db.collection(CARTS).doc(event.aggregateId).update(flatten(nfe))
    },
  },
})
