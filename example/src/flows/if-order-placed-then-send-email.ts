import { FlowDefinition } from '../../../src'

import { getEmailService } from '../services/email'

export const ifOrderPlacedThenSendEmail: FlowDefinition = {
  reactions: {
    'cart.orderPlaced': async (event: Domain.Cart.OrderPlaced, ctx) => {
      const emailService = getEmailService()

      await emailService.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
}
