import firebase from 'firebase/app'
import 'firebase/firestore'

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

export const createFirebaseViewStore = (
  firebaseApp: firebase.app.App,
): ViewStore => {
  const db = firebaseApp.firestore()

  return {
    values: {
      arrayRemove: firebase.firestore.FieldValue.arrayRemove,
      arrayUnion: firebase.firestore.FieldValue.arrayUnion,
      delete: firebase.firestore.FieldValue.delete,
      geoPoint: (latitude, longitude) =>
        new firebase.firestore.GeoPoint(latitude, longitude),
      increment: firebase.firestore.FieldValue.increment,
      serverTimestamp: firebase.firestore.FieldValue.serverTimestamp,
      timestamp: date => {
        if (date) {
          return firebase.firestore.Timestamp.fromDate(
            date instanceof Date ? date : new Date(date),
          )
        }

        return firebase.firestore.Timestamp.now()
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
