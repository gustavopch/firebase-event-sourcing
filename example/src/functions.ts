import firebaseAdmin from 'firebase-admin'

import { createFunctions } from '../../src'
import { domain } from './domain'
import { flows } from './flows'
import { views } from './views'

const firebaseAdminApp = firebaseAdmin.initializeApp()

module.exports = createFunctions(firebaseAdminApp, {
  domain,
  flows,
  views,
})
