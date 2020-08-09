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
  handle: command => ({
    name: 'itemAdded',
    data: {
      title: command.data.title,
    },
  }),
}
