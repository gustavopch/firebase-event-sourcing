import { Event } from '../../../../../../src'

export type ShoppingCartItemAdded = Event<
  'shopping.cart.itemAdded',
  {
    title: string
  }
>
