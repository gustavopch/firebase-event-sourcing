import { Command, CommandHandler } from '../../../../../../src'
import { ShoppingCartItemRemoved } from '../events/item-removed'

export type ShoppingCartRemoveItem = Command<
  'shopping.cart.removeItem',
  {
    itemId: string
  }
>

export const removeItem: CommandHandler<
  ShoppingCartRemoveItem,
  ShoppingCartItemRemoved
> = data => ({
  name: 'shopping.cart.itemRemoved',
  data: {
    itemId: data.itemId,
  },
})
