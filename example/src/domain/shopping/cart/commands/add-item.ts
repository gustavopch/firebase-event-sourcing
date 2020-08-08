import { Command, CommandHandler } from '../../../../../../src'
import {
  SHOPPING_CART_ITEM_ADDED,
  ShoppingCartItemAdded,
} from '../events/item-added'

export type ShoppingCartAddItem = Command<
  'shopping.cart.addItem',
  {
    title: string
  }
>

export const addItem: CommandHandler<
  ShoppingCartAddItem,
  ShoppingCartItemAdded
> = data => ({
  name: SHOPPING_CART_ITEM_ADDED,
  data: {
    title: data.title,
  },
})
