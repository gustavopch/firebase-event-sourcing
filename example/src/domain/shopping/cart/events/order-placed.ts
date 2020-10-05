import { Event, EventDefinition } from '../../../../../../src'
import { ShoppingCartState } from '../state'

export type ShoppingCartOrderPlaced = Event<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'orderPlaced'
  data: null
}>

export const orderPlaced: EventDefinition<
  ShoppingCartState,
  ShoppingCartOrderPlaced
> = {
  handle: (state, event) => ({
    isPlaced: true,
  }),
}
