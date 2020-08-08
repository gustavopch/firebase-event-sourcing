import { Event } from '../../../../../../src'

export type ShoppingCartItemRemoved = Event<
  'itemRemoved',
  {
    itemId: string
  }
>
