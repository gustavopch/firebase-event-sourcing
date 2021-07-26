import { ServiceContext, Services } from '../../../src'

import { createEmailService } from './email'

declare module '../../../src' {
  interface Services {
    email: Services.Email.Instance
  }
}

export const services = (ctx: ServiceContext): Services => ({
  email: createEmailService(ctx),
})
