import { Event, defineAggregate } from '../../../../src'

export const SHOPPING_CART = 'shopping.cart'

export const SHOPPING_CART_INITIALIZED = `${SHOPPING_CART}.initialized`
export type ShoppingCartInitialized = Event<null>

export const SHOPPING_CART_ITEM_ADDED = `${SHOPPING_CART}.itemAdded`
export type ShoppingCartItemAdded = Event<{
  title: string
}>

export const SHOPPING_CART_ITEM_REMOVED = `${SHOPPING_CART}.itemRemoved`
export type ShoppingCartItemRemoved = Event<{
  itemId: string
}>

export const SHOPPING_CART_ORDER_PLACED = `${SHOPPING_CART}.orderPlaced`
export type ShoppingCartOrderPlaced = Event<null>

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
