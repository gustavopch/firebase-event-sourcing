import { createClient } from '../../src'
import { config } from './config'
import type { domain } from './domain'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createEventSourcingClient = () => {
  const client = createClient<typeof domain>({
    baseUrl: config.firebase.cloudFunctionsBaseUrl,
  })

  return client
}
