import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartItemRemoved } from '../events/item-removed'

export type ShoppingCartRemoveItem = Command<
  'shopping.cart.removeItem',
  {
    itemId: string
  }
>

export const removeItem: CommandDefinition<
  ShoppingCartRemoveItem,
  ShoppingCartItemRemoved
> = {
  handle: data => ({
    name: 'shopping.cart.itemRemoved',
    data: {
      itemId: data.itemId,
    },
  }),
}
