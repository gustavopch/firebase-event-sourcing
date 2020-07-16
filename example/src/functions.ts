import firebaseAdmin from 'firebase-admin'

import {
  createProcessEventFirebaseFunction,
  createProcessJobsFirebaseFunction,
} from '../../src'
import { domain } from './domain'
import { flows } from './flows'
import { views } from './views'

const firebaseAdminApp = firebaseAdmin.initializeApp()

export const processEvent = createProcessEventFirebaseFunction(
  firebaseAdminApp,
  flows,
  views,
)

export const processJobs = createProcessJobsFirebaseFunction(
  firebaseAdminApp,
  domain,
  { schedule: 'every 1 minute' },
)
