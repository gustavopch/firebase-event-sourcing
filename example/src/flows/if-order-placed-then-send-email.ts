import { FlowDefinition } from '../../../src'

export const ifOrderPlacedThenSendEmail: FlowDefinition = {
  reactions: {
    'cart.orderPlaced': async (event: Domain.Cart.OrderPlaced, ctx) => {
      await ctx.email.send({
        to: 'customer@example.com',
        body: 'Order placed with success!',
      })
    },
  },
}
