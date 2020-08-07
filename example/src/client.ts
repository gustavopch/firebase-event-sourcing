import { createClient } from '../../src'
import { config } from './config'
import { domain } from './domain'
import { flows } from './flows'
import { views } from './views'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createEventSourcingClient = () => {
  const client = createClient(
    {
      domain,
      flows,
      views,
    },
    {
      baseUrl: config.firebase.cloudFunctionsBaseUrl,
    },
  )

  return client
}
