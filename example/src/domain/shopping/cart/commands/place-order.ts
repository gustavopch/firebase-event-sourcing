import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartOrderPlaced } from '../events/order-placed'
import { ShoppingCartState } from '../state'

export type ShoppingCartPlaceOrder = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'placeOrder'
  data: null
}>

export const placeOrder: CommandDefinition<
  ShoppingCartState,
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = {
  handle: (state, command) => ({
    name: 'orderPlaced',
    data: null,
  }),
}
