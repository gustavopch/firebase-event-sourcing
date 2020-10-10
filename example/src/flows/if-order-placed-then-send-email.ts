import { FlowDefinition } from '../../../src'
import * as ShoppingCart from '../domain/shopping/cart/events'

import { getEmailService } from '../services/email-service'

export const ifOrderPlacedThenSendEmail: FlowDefinition = {
  reactions: {
    'shopping.cart.orderPlaced': async (
      event: ShoppingCart.OrderPlaced,
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
