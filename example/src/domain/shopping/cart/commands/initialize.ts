import { Command, CommandHandler } from '../../../../../../src'
import { ShoppingCartInitialized } from '../events/initialized'

export type ShoppingCartInitialize = Command<'shopping.cart.initialize', null>

export const initialize: CommandHandler<
  ShoppingCartInitialize,
  ShoppingCartInitialized
> = data => ({
  name: 'shopping.cart.initialized',
  data: null,
})
