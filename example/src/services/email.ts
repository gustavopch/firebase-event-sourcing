import { ServiceContext } from '../../../src'

declare global {
  namespace Services.Email {
    type Instance = ReturnType<typeof createEmailService>
  }
}

export const createEmailService = (ctx: ServiceContext) => {
  return {
    send: async ({ to, body }: { to: string; body: string }): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log(`Sent email to ${to}`)
    },
  }
}
