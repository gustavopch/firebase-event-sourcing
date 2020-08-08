import { Command, CommandHandler } from '../../../../../../src'
import { ShoppingCartItemAdded } from '../events/item-added'

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
  name: 'shopping.cart.itemAdded',
  data: {
    title: data.title,
  },
})
