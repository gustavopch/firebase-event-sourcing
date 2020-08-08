import { Command, CommandHandler } from '../../../../../../src'
import {
  SHOPPING_CART_INITIALIZED,
  ShoppingCartInitialized,
} from '../events/initialized'

export type ShoppingCartInitialize = Command<'shopping.cart.initialize', null>

export const initialize: CommandHandler<
  ShoppingCartInitialize,
  ShoppingCartInitialized
> = data => ({
  name: SHOPPING_CART_INITIALIZED,
  data: null,
})
