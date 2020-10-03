import { addItem } from './commands/add-item'
import { initialize } from './commands/initialize'
import { placeOrder } from './commands/place-order'
import { removeItem } from './commands/remove-item'
import { orderPlaced } from './events/order-placed'
import { getInitialState } from './state'

export const cart = {
  getInitialState,

  commands: {
    initialize,
    addItem,
    removeItem,
    placeOrder,
  },

  events: {
    orderPlaced,
  },
}
