import { defineFlow } from '../../../src'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartInitialized,
} from '../domain/shopping/cart'
import { getEmailService } from '../services/email-service'

export const ifOrderPlacedThenSendEmail = defineFlow({
  reactions: {
    [SHOPPING_CART_ORDER_PLACED]: async (
      manager,
      event: ShoppingCartInitialized,
    ) => {
      const emailService = getEmailService()

      await emailService.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
})
