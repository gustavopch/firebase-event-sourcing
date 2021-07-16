import * as Cart from './cart'

export const domain = {
  cart: {
    getInitialState: Cart.getInitialState,
    commands: Cart.commands,
    events: Cart.events,
  },
}

export type { Cart }
