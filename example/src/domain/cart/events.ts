import {
  EventCreationProps,
  EventDefinition,
  EventPreset,
} from '../../../../src'
import { State } from './state'

type Event<T extends EventCreationProps> = EventPreset<'cart', T>

export type Initialized = Event<{
  name: 'initialized'
  data: null
}>

export type ItemAdded = Event<{
  name: 'itemAdded'
  data: { title: string }
}>

export type ItemRemoved = Event<{
  name: 'itemRemoved'
  data: { itemId: string }
}>

export type OrderPlaced = Event<{
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
