import { Command, CommandDefinition } from '../../../../../src'
import {
  ShoppingCartInitialized,
  ShoppingCartItemAdded,
  ShoppingCartItemRemoved,
  ShoppingCartOrderPlaced,
} from './events'
import { ShoppingCartState } from './state'

export type ShoppingCartInitialize = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialize'
  data: null
}>

export type ShoppingCartAddItem = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'addItem'
  data: {
    title: string
  }
}>

export type ShoppingCartRemoveItem = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'removeItem'
  data: {
    itemId: string
  }
}>

export type ShoppingCartPlaceOrder = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'placeOrder'
  data: null
}>

const initialize: CommandDefinition<
  ShoppingCartState,
  ShoppingCartInitialize,
  ShoppingCartInitialized
> = {
  handle: (state, command) => ({
    name: 'initialized',
    data: null,
  }),
}

const addItem: CommandDefinition<
  ShoppingCartState,
  ShoppingCartAddItem,
  ShoppingCartItemAdded
> = {
  handle: (state, command) => ({
    name: 'itemAdded',
    data: {
      title: command.data.title,
    },
  }),
}

const removeItem: CommandDefinition<
  ShoppingCartState,
  ShoppingCartRemoveItem,
  ShoppingCartItemRemoved
> = {
  handle: (state, command) => ({
    name: 'itemRemoved',
    data: {
      itemId: command.data.itemId,
    },
  }),
}

const placeOrder: CommandDefinition<
  ShoppingCartState,
  ShoppingCartPlaceOrder,
  ShoppingCartOrderPlaced
> = {
  handle: (state, command) => ({
    name: 'orderPlaced',
    data: null,
  }),
}

export const commands = {
  initialize,
  addItem,
  removeItem,
  placeOrder,
}
