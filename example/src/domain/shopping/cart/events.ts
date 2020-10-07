import { Event, EventDefinition } from '../../../../../src'
import { ShoppingCartState } from './state'

export type ShoppingCartInitialized = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialized'
  data: null
}>

export type ShoppingCartItemAdded = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'itemAdded'
  data: {
    title: string
  }
}>

export type ShoppingCartItemRemoved = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'itemRemoved'
  data: {
    itemId: string
  }
}>

export type ShoppingCartOrderPlaced = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'orderPlaced'
  data: null
}>

const orderPlaced: EventDefinition<
  ShoppingCartState,
  ShoppingCartOrderPlaced
> = {
  handle: (state, event) => ({
    isPlaced: true,
  }),
}

export const events = {
  orderPlaced,
}
