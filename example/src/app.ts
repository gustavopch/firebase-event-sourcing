import firebaseAdmin from 'firebase-admin'

import { loadApp } from '../../src'
import { domain } from './domain'
import { flows } from './flows'
import { views } from './views'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initializeApp = (
  firebaseApp: firebase.app.App | firebaseAdmin.app.App,
) => {
  const app = loadApp(firebaseApp, {
    domain,
    flows,
    views,
  })

  return app
}
