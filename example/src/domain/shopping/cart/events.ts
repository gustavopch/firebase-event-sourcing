import { Event, EventDefinition } from '../../../../../src'
import { State } from './state'

export type Initialized = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialized'
  data: null
}>

export type ItemAdded = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'itemAdded'
  data: {
    title: string
  }
}>

export type ItemRemoved = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'itemRemoved'
  data: {
    itemId: string
  }
}>

export type OrderPlaced = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'orderPlaced'
  data: null
}>

const orderPlaced: EventDefinition<State, OrderPlaced> = {
  handle: (state, event) => ({
    isPlaced: true,
  }),
}

export const events = {
  orderPlaced,
}
