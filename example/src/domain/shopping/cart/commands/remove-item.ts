import { Command, CommandHandler } from '../../../../../../src'
import {
  SHOPPING_CART_ITEM_REMOVED,
  ShoppingCartItemRemoved,
} from '../events/item-removed'

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
  name: SHOPPING_CART_ITEM_REMOVED,
  data: {
    itemId: data.itemId,
  },
})
