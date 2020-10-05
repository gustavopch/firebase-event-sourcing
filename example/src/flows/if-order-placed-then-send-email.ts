import { FlowDefinition } from '../../../src'
import { ShoppingCartOrderPlaced } from '../domain/shopping/cart/events/order-placed'

import { getEmailService } from '../services/email-service'

export const ifOrderPlacedThenSendEmail: FlowDefinition = {
  reactions: {
    'shopping.cart.orderPlaced': async (
      event: ShoppingCartOrderPlaced,
      { flow },
    ) => {
      const emailService = getEmailService()

      await emailService.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
}
