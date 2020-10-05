import firebase from 'firebase/app'

import { createClient } from '../../src'
import { config } from './config'
import type { domain } from './domain'
import type { flows } from './flows'
import type { views } from './views'

type App = {
  domain: typeof domain
  flows: typeof flows
  views: typeof views
}

export const createEventSourcingClient = () => {
  const client = createClient<App>(firebase.app(), {
    functionsUrl: config.firebase.functionsUrl,
  })

  return client
}
