import { Command, CommandDefinition } from '../../../../../../src'
import { ShoppingCartItemAdded } from '../events/item-added'

export type ShoppingCartAddItem = Command<
  'addItem',
  {
    title: string
  }
>

export const addItem: CommandDefinition<
  ShoppingCartAddItem,
  ShoppingCartItemAdded
> = {
  handle: data => ({
    name: 'itemAdded',
    data: {
      title: data.title,
    },
  }),
}
