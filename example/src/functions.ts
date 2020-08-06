import firebaseAdmin from 'firebase-admin'

import { createFunctions } from '../../src'
import { domain } from './domain'
import { flows } from './flows'
import { views } from './views'

const firebaseAdminApp = firebaseAdmin.initializeApp()

firebaseAdminApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

module.exports = createFunctions(firebaseAdminApp, {
  domain,
  flows,
  views,
})
