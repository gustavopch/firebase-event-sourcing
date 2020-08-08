import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartItemAdded } from '../events/item-added'

export type ShoppingCartAddItem = Command<
  'shopping.cart.addItem',
  {
    title: string
  }
>

export const addItem: CommandDefinition<
  ShoppingCartAddItem,
  ShoppingCartItemAdded
> = {
  handle: data => ({
    name: 'shopping.cart.itemAdded',
    data: {
      title: data.title,
    },
  }),
}
