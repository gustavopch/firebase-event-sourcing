import { Event, EventDefinition } from '../../../../../../src'
import { State } from '../state'

export type ShoppingCartOrderPlaced = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'orderPlaced'
  data: null
}>

export const orderPlaced: EventDefinition<ShoppingCartOrderPlaced, State> = {
  handle: (state, event) => ({
    isPlaced: true,
  }),
}
