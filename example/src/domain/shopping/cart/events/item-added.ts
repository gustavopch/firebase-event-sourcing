import { Event } from '../../../../../../src'

export type ShoppingCartItemAdded = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'itemAdded'
  data: {
    title: string
  }
}>
