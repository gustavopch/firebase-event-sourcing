import { Event, EventDefinition } from '../../../../../../src'
import { ShoppingCartState } from '../state'

export type ShoppingCartOrderPlaced = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'orderPlaced'
  data: null
}>

export const orderPlaced: EventDefinition<
  ShoppingCartOrderPlaced,
  ShoppingCartState
> = {
  handle: (state, event) => ({
    isPlaced: true,
  }),
}
