import { Event } from '../../../../../../src'

export type ShoppingCartItemAdded = Event<
  'itemAdded',
  {
    title: string
  }
>
