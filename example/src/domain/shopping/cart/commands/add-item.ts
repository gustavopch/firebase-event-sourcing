import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartItemAdded } from '../events/item-added'
import { ShoppingCartState } from '../state'

export type ShoppingCartAddItem = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'addItem'
  data: {
    title: string
  }
}>

export const addItem: CommandDefinition<
  ShoppingCartAddItem,
  ShoppingCartItemAdded,
  ShoppingCartState
> = {
  handle: (state, command) => ({
    name: 'itemAdded',
    data: {
      title: command.data.title,
    },
  }),
}
