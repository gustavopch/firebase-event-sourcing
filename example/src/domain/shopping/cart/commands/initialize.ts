import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartInitialized } from '../events/initialized'
import { ShoppingCartState } from '../state'

export type ShoppingCartInitialize = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialize'
  data: null
}>

export const initialize: CommandDefinition<
  ShoppingCartInitialize,
  ShoppingCartInitialized,
  ShoppingCartState
> = {
  handle: (state, command) => ({
    name: 'initialized',
    data: null,
  }),
}
