import { FlowDefinition } from '../../../src'
import * as Domain from '../domain'

import { getEmailService } from '../services/email-service'

export const ifOrderPlacedThenSendEmail: FlowDefinition = {
  reactions: {
    'cart.orderPlaced': async (event: Domain.Cart.OrderPlaced, { flow }) => {
      const emailService = getEmailService()

      await emailService.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
}
