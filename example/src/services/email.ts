import { ServiceContext } from '../../../src'

declare global {
  namespace Services.Email {
    type Instance = {
      send: (params: { to: string; body: string }) => Promise<void>
    }
  }
}

export const createEmailService = (
  ctx: ServiceContext,
): Services.Email.Instance => {
  return {
    send: async ({ to, body }) => {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log(`Sent email to ${to}`)
    },
  }
}
