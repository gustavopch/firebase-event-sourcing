import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartInitialized } from '../events/initialized'

export type ShoppingCartInitialize = Command<'shopping.cart.initialize', null>

export const initialize: CommandDefinition<
  ShoppingCartInitialize,
  ShoppingCartInitialized
> = {
  handle: data => ({
    name: 'shopping.cart.initialized',
    data: null,
  }),
}
