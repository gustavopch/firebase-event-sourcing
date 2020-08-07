import type firebaseAdmin from 'firebase-admin'

import { Location } from './location'

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: firebase.firestore.Timestamp | firebaseAdmin.firestore.Timestamp
  revision: number
  userId?: string
  ip?: string
  userAgent?: string
  location?: Location
}
