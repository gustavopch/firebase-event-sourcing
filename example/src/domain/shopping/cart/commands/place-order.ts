import { Command, CommandHandler } from '../../../../../../src'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from '../events/order-placed'

export type ShoppingCartPlaceOrder = Command<'shopping.cart.placeOrder', null>

export const placeOrder: CommandHandler<
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = data => ({
  name: SHOPPING_CART_ORDER_PLACED,
  data: null,
})
