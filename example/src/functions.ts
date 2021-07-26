import firebase from 'firebase-admin'

import { createFunctions } from '../../src/functions'
import { domain } from './domain'
import { flows } from './flows'
import { services } from './services'
import { views } from './views'

const firebaseApp = firebase.initializeApp()

firebaseApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

module.exports = createFunctions(firebaseApp, {
  domain,
  flows,
  views,
  services,
})
