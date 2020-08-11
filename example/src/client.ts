import { createClient } from '../../src'
import { config } from './config'
import type { domain } from './domain'
import type { flows } from './flows'
import type { views } from './views'

type Application = {
  domain: typeof domain
  flows: typeof flows
  views: typeof views
}

export const createEventSourcingClient = () => {
  const client = createClient<Application>({
    baseUrl: config.firebase.cloudFunctionsBaseUrl,
  })

  return client
}
