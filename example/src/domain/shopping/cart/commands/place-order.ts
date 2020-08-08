import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartOrderPlaced } from '../events/order-placed'

export type ShoppingCartPlaceOrder = Command<'shopping.cart.placeOrder', null>

export const placeOrder: CommandDefinition<
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = {
  handle: data => ({
    name: 'shopping.cart.orderPlaced',
    data: null,
  }),
}
