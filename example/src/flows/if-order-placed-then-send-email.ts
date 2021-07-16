import { FlowDefinition } from '../../../src'
import * as CartEvents from '../domain/cart/events'

import { getEmailService } from '../services/email-service'

export const ifOrderPlacedThenSendEmail: FlowDefinition = {
  reactions: {
    'cart.orderPlaced': async (event: CartEvents.OrderPlaced, { flow }) => {
      const emailService = getEmailService()

      await emailService.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
}
