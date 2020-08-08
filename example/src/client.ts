import { createClient } from '../../src'
import { config } from './config'
import type { domain } from './domain'

export const createEventSourcingClient = () => {
  const client = createClient<typeof domain>({
    baseUrl: config.firebase.cloudFunctionsBaseUrl,
  })

  return client
}
