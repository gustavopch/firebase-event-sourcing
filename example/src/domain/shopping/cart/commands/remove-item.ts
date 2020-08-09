import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartItemRemoved } from '../events/item-removed'

export type ShoppingCartRemoveItem = Command<
  'removeItem',
  {
    itemId: string
  }
>

export const removeItem: CommandDefinition<
  ShoppingCartRemoveItem,
  ShoppingCartItemRemoved
> = {
  isAuthorized: () => {
    return true
  },

  handle: command => ({
    name: 'itemRemoved',
    data: {
      itemId: command.data.itemId,
    },
  }),
}
