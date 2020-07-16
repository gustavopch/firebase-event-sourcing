import firebaseAdmin from 'firebase-admin'

import {
  _delete,
  create,
  exists,
  generateId,
  get,
  getAndObserve,
  query,
  queryAndObserve,
  update,
  updateOrCreate,
} from './shared'
import { ViewStore } from './types'

export const createFirebaseAdminViewStore = (
  firebaseAdminApp: firebaseAdmin.app.App,
): ViewStore => {
  const db = firebaseAdminApp.firestore()

  return {
    values: {
      arrayRemove: firebaseAdmin.firestore.FieldValue.arrayRemove,
      arrayUnion: firebaseAdmin.firestore.FieldValue.arrayUnion,
      delete: firebaseAdmin.firestore.FieldValue.delete,
      geoPoint: (latitude, longitude) => new firebaseAdmin.firestore.GeoPoint(latitude, longitude), // prettier-ignore
      increment: firebaseAdmin.firestore.FieldValue.increment,
      serverTimestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp,
      timestamp: date => {
        if (date) {
          return firebaseAdmin.firestore.Timestamp.fromDate(
            date instanceof Date ? date : new Date(date),
          )
        }

        return firebaseAdmin.firestore.Timestamp.now()
      },
    },

    generateId: generateId(db.collection('whatever')),

    exists: exists(db),

    get: get(db),

    getAndObserve: getAndObserve(db),

    query: query(db),

    queryAndObserve: queryAndObserve(db),

    create: create(db),

    update: update(db),

    updateOrCreate: updateOrCreate(db),

    delete: _delete(db),
  }
}
