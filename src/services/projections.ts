import firebase from 'firebase-admin'

import { ViewProjectionState } from '../types/view'

export type ProjectionsService = ReturnType<typeof createProjectionsService>

export const createProjectionsService = (firebaseApp: firebase.app.App) => {
  const db = firebaseApp.firestore()

  const get = async (
    collectionName: string,
    projectionId: string,
  ): Promise<ViewProjectionState | null> => {
    const doc = await db
      .collection(collectionName)
      .doc(projectionId)
      .get()
      .then(snap => snap.data() ?? null)

    return doc
  }

  const getAll = async (
    collectionName: string,
    projectionIds: string[],
  ): Promise<ViewProjectionState[]> => {
    const docs = (
      await Promise.all(projectionIds.map(id => get(collectionName, id)))
    ).filter((doc): doc is ViewProjectionState => Boolean(doc))

    return docs
  }

  const query = async (
    collectionName: string,
    query?: (
      collection: firebase.firestore.CollectionReference,
    ) => firebase.firestore.Query,
  ): Promise<ViewProjectionState[]> => {
    const collection = db.collection(collectionName)

    const snap = await (query ? query(collection).get() : collection.get())
    const docs = snap.docs.map(snap => snap.data())

    return docs
  }

  return {
    get,
    getAll,
    query,
  }
}
