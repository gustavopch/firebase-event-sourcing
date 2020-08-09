import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartOrderPlaced } from '../events/order-placed'

export type ShoppingCartPlaceOrder = Command<'placeOrder', null>

export const placeOrder: CommandDefinition<
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = {
  isAuthorized: () => {
    return true
  },

  handle: command => ({
    name: 'orderPlaced',
    data: null,
  }),
}
