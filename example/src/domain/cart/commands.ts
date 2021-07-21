import {
  CommandCreationProps,
  CommandDefinition,
  CommandPreset,
} from '../../../../src'
import { Initialized, ItemAdded, ItemRemoved, OrderPlaced } from './events'
import { State } from './state'

type Command<T extends CommandCreationProps> = CommandPreset<'cart', T>

export type Initialize = Command<{
  name: 'initialize'
  data: null
}>

export type AddItem = Command<{
  name: 'addItem'
  data: { title: string }
}>

export type RemoveItem = Command<{
  name: 'removeItem'
  data: { itemId: string }
}>

export type PlaceOrder = Command<{
  name: 'placeOrder'
  data: null
}>

const initialize: CommandDefinition<State, Initialize, Initialized> = {
  handle: (cart, command) => ({
    name: 'initialized',
    data: null,
  }),
}

const addItem: CommandDefinition<State, AddItem, ItemAdded> = {
  handle: (cart, command) => ({
    name: 'itemAdded',
    data: {
      title: command.data.title,
    },
  }),
}

const removeItem: CommandDefinition<State, RemoveItem, ItemRemoved> = {
  handle: (cart, command) => ({
    name: 'itemRemoved',
    data: {
      itemId: command.data.itemId,
    },
  }),
}

const placeOrder: CommandDefinition<State, PlaceOrder, OrderPlaced> = {
  handle: (cart, command) => ({
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
