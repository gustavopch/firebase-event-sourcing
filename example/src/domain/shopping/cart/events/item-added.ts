import { Event } from '../../../../../../src'

export const SHOPPING_CART_ITEM_ADDED = 'shopping.cart.itemAdded'

export type ShoppingCartItemAdded = Event<
  'shopping.cart.itemAdded',
  {
    title: string
  }
>
