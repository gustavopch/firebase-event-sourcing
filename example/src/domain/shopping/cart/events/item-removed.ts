import { Event } from '../../../../../../src'

export const SHOPPING_CART_ITEM_REMOVED = 'shopping.cart.itemRemoved'

export type ShoppingCartItemRemoved = Event<
  'shopping.cart.itemRemoved',
  {
    itemId: string
  }
>
