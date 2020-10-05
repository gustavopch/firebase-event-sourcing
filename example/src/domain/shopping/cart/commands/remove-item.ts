import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartItemRemoved } from '../events/item-removed'
import { ShoppingCartState } from '../state'

export type ShoppingCartRemoveItem = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'removeItem'
  data: {
    itemId: string
  }
}>

export const removeItem: CommandDefinition<
  ShoppingCartRemoveItem,
  ShoppingCartItemRemoved,
  ShoppingCartState
> = {
  handle: (state, command) => ({
    name: 'itemRemoved',
    data: {
      itemId: command.data.itemId,
    },
  }),
}
