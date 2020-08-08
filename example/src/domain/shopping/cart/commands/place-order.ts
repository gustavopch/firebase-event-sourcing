import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartOrderPlaced } from '../events/order-placed'

export type ShoppingCartPlaceOrder = Command<'placeOrder', null>

export const placeOrder: CommandDefinition<
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = {
  handle: data => ({
    name: 'orderPlaced',
    data: null,
  }),
}
