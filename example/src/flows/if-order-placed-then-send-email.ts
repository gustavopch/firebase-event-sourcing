import { FlowDefinition } from '../../../src'

export const ifOrderPlacedThenSendEmail: FlowDefinition<Domain.Cart.OrderPlaced> =
  {
    reactions: {
      'cart.orderPlaced': async (event, ctx) => {
        await ctx.email.send({
          to: 'customer@example.com',
          body: 'Order placed with success!',
        })
      },
    },
  }
