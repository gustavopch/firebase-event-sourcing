import { defineAggregate } from '../../../../../src'
import {
  SHOPPING_CART_INITIALIZED,
  ShoppingCartInitialized,
} from './events/initialized'
import {
  SHOPPING_CART_ITEM_ADDED,
  ShoppingCartItemAdded,
} from './events/item-added'
import {
  SHOPPING_CART_ITEM_REMOVED,
  ShoppingCartItemRemoved,
} from './events/item-removed'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from './events/order-placed'

export const SHOPPING_CART = 'shopping.cart'

export const cart = defineAggregate({
  name: SHOPPING_CART,

  commands: {
    initialize: (data: ShoppingCartInitialized['data']) => ({
      name: SHOPPING_CART_INITIALIZED,
      data,
    }),

    addItem: (data: ShoppingCartItemAdded['data']) => ({
      name: SHOPPING_CART_ITEM_ADDED,
      data,
    }),

    removeItem: (data: ShoppingCartItemRemoved['data']) => ({
      name: SHOPPING_CART_ITEM_REMOVED,
      data,
    }),

    placeOrder: (data: ShoppingCartOrderPlaced['data']) => ({
      name: SHOPPING_CART_ORDER_PLACED,
      data,
    }),
  },
})
