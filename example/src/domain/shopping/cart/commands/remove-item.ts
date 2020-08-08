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
  handle: data => ({
    name: 'itemRemoved',
    data: {
      itemId: data.itemId,
    },
  }),
}
