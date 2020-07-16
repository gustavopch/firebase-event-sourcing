import type firebaseAdmin from 'firebase-admin'

import { createFirebaseAdminJobStore } from './firebase-admin'
import { JobStore } from './types'

export const createJobStore = (
  firebaseApp: firebaseAdmin.app.App,
): JobStore => {
  return createFirebaseAdminJobStore(firebaseApp)
}

export * from './types'
