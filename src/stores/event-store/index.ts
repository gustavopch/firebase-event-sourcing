import type firebaseAdmin from 'firebase-admin'

import { createFirebaseEventStore } from './firebase'
import { createFirebaseAdminEventStore } from './firebase-admin'
import { EventStore } from './types'

export const createEventStore = (
  firebaseApp: firebase.app.App | firebaseAdmin.app.App,
): EventStore => {
  return 'projectManagement' in firebaseApp
    ? createFirebaseAdminEventStore(firebaseApp)
    : createFirebaseEventStore(firebaseApp)
}

export * from './types'
