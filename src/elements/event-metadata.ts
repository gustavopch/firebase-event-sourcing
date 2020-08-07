import type firebaseAdmin from 'firebase-admin'

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: firebase.firestore.Timestamp | firebaseAdmin.firestore.Timestamp
  revision: number
  userId?: string
}
