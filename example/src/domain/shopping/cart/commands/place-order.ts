import { Command, CommandHandler } from '../../../../../../src'
import { ShoppingCartOrderPlaced } from '../events/order-placed'

export type ShoppingCartPlaceOrder = Command<'shopping.cart.placeOrder', null>

export const placeOrder: CommandHandler<
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = data => ({
  name: 'shopping.cart.orderPlaced',
  data: null,
})
