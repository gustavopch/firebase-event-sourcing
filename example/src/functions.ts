import firebase from 'firebase-admin'

import { createFunctions } from '../../src'
import { domain } from './domain'
import { flows } from './flows'
import { views } from './views'

const firebaseApp = firebase.initializeApp()

firebaseApp.firestore().settings({
  ignoreUndefinedProperties: true,
})

module.exports = createFunctions(firebaseApp, {
  domain,
  flows,
  views,
})
