import { Event } from '../../../../../../src'

export type ShoppingCartItemRemoved = Event<
  'shopping.cart.itemRemoved',
  {
    itemId: string
  }
>
