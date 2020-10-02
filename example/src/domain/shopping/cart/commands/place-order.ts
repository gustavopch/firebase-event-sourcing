import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartOrderPlaced } from '../events/order-placed'

export type ShoppingCartPlaceOrder = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'placeOrder'
  data: null
}>

export const placeOrder: CommandDefinition<
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = {
  handle: command => ({
    name: 'orderPlaced',
    data: null,
  }),
}
