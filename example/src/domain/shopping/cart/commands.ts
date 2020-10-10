import { Command, CommandDefinition } from '../../../../../src'
import { Initialized, ItemAdded, ItemRemoved, OrderPlaced } from './events'
import { State } from './state'

export type Initialize = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'initialize'
  data: null
}>

export type AddItem = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'addItem'
  data: {
    title: string
  }
}>

export type RemoveItem = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'removeItem'
  data: {
    itemId: string
  }
}>

export type PlaceOrder = Command<{
  contextName: 'shopping'
  aggregateName: 'cart'
  name: 'placeOrder'
  data: null
}>

const initialize: CommandDefinition<State, Initialize, Initialized> = {
  handle: (state, command) => ({
    name: 'initialized',
    data: null,
  }),
}

const addItem: CommandDefinition<State, AddItem, ItemAdded> = {
  handle: (state, command) => ({
    name: 'itemAdded',
    data: {
      title: command.data.title,
    },
  }),
}

const removeItem: CommandDefinition<State, RemoveItem, ItemRemoved> = {
  handle: (state, command) => ({
    name: 'itemRemoved',
    data: {
      itemId: command.data.itemId,
    },
  }),
}

const placeOrder: CommandDefinition<State, PlaceOrder, OrderPlaced> = {
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
