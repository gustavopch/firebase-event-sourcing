import type firebaseAdmin from 'firebase-admin'

import { createFirebaseViewStore } from './firebase'
import { createFirebaseAdminViewStore } from './firebase-admin'
import { ViewStore } from './types'

export const createViewStore = (
  firebaseApp: firebase.app.App | firebaseAdmin.app.App,
): ViewStore => {
  return 'projectManagement' in firebaseApp
    ? createFirebaseAdminViewStore(firebaseApp)
    : createFirebaseViewStore(firebaseApp)
}

export * from './types'
