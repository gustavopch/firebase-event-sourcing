import { Event } from '../../../../../../src'

export type ShoppingCartInitialized = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialized'
  data: null
}>
