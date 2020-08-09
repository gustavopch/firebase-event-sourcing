import { Event, EventDefinition } from '../../../../../../src'
import { State } from '../state'

export type ShoppingCartOrderPlaced = Event<'orderPlaced', null>

export const orderPlaced: EventDefinition<ShoppingCartOrderPlaced, State> = {
  handle: event => ({
    isPlaced: true,
  }),
}
