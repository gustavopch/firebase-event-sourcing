import { Event } from '../../../../../../src'

export type ShoppingCartItemRemoved = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'itemRemoved'
  data: {
    itemId: string
  }
}>
