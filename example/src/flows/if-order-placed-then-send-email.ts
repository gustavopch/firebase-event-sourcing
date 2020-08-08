import { defineFlow } from '../../../src'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from '../domain/shopping/cart/events/order-placed'

import { getEmailService } from '../services/email-service'

export const ifOrderPlacedThenSendEmail = defineFlow({
  reactions: {
    [SHOPPING_CART_ORDER_PLACED]: async (
      manager,
      event: ShoppingCartOrderPlaced,
    ) => {
      const emailService = getEmailService()

      await emailService.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
})
