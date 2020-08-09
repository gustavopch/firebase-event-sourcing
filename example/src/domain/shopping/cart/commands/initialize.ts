import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartInitialized } from '../events/initialized'

export type ShoppingCartInitialize = Command<'initialize', null>

export const initialize: CommandDefinition<
  ShoppingCartInitialize,
  ShoppingCartInitialized
> = {
  handle: command => ({
    name: 'initialized',
    data: null,
  }),
}
