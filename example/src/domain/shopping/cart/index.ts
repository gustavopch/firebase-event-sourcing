import { addItem } from './commands/add-item'
import { initialize } from './commands/initialize'
import { placeOrder } from './commands/place-order'
import { removeItem } from './commands/remove-item'

export const cart = {
  commands: {
    initialize,
    addItem,
    removeItem,
    placeOrder,
  },
}
