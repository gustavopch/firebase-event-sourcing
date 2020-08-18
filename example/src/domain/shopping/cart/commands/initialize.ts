import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartInitialized } from '../events/initialized'

export type ShoppingCartInitialize = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialize'
  data: null
}>

export const initialize: CommandDefinition<
  ShoppingCartInitialize,
  ShoppingCartInitialized
> = {
  isAuthorized: () => {
    return true
  },

  handle: command => ({
    name: 'initialized',
    data: null,
  }),
}
