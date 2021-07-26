import {
  EventCreationProps,
  EventDefinition,
  EventPreset,
} from '../../../../src'

type Event<T extends EventCreationProps> = EventPreset<'cart', T>

declare global {
  namespace Domain.Cart {
    type Initialized = Event<{
      name: 'initialized'
      data: null
    }>

    type ItemAdded = Event<{
      name: 'itemAdded'
      data: { title: string }
    }>

    type ItemRemoved = Event<{
      name: 'itemRemoved'
      data: { itemId: string }
    }>

    type OrderPlaced = Event<{
      name: 'orderPlaced'
      data: null
    }>

    type Discarded = Event<{
      name: 'discarded'
      data: null
    }>
  }
}

export const orderPlaced: EventDefinition<
  Domain.Cart.State,
  Domain.Cart.OrderPlaced
> = {
  handle: (cart, event) => {
    return {
      isPlaced: true,
    }
  },
}
