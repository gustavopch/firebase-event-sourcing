import {
  CommandCreationProps,
  CommandDefinition,
  CommandPreset,
} from '../../../../src'

type Command<T extends CommandCreationProps> = CommandPreset<'cart', T>

declare global {
  namespace Domain.Cart {
    type Initialize = Command<{
      name: 'initialize'
      data: null
    }>

    type AddItem = Command<{
      name: 'addItem'
      data: { title: string }
    }>

    type RemoveItem = Command<{
      name: 'removeItem'
      data: { itemId: string }
    }>

    type PlaceOrder = Command<{
      name: 'placeOrder'
      data: null
    }>

    type Discard = Command<{
      name: 'discard'
      data: null
    }>
  }
}

export const initialize: CommandDefinition<
  Domain.Cart.State,
  Domain.Cart.Initialize,
  Domain.Cart.Initialized
> = {
  handle: (cart, command) => {
    return {
      name: 'initialized',
      data: null,
    }
  },
}

export const addItem: CommandDefinition<
  Domain.Cart.State,
  Domain.Cart.AddItem,
  Domain.Cart.ItemAdded
> = {
  handle: (cart, command) => {
    return {
      name: 'itemAdded',
      data: {
        title: command.data.title,
      },
    }
  },
}

export const removeItem: CommandDefinition<
  Domain.Cart.State,
  Domain.Cart.RemoveItem,
  Domain.Cart.ItemRemoved
> = {
  handle: (cart, command) => {
    return {
      name: 'itemRemoved',
      data: {
        itemId: command.data.itemId,
      },
    }
  },
}

export const placeOrder: CommandDefinition<
  Domain.Cart.State,
  Domain.Cart.PlaceOrder,
  Domain.Cart.OrderPlaced
> = {
  handle: (cart, command) => {
    return {
      name: 'orderPlaced',
      data: null,
    }
  },
}

export const discard: CommandDefinition<
  Domain.Cart.State,
  Domain.Cart.Discard,
  Domain.Cart.Discarded
> = {
  handle: (cart, command) => {
    return {
      name: 'discarded',
      data: null,
    }
  },
}
