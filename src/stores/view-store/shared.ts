import { Event } from '../../elements/event'
import { flatten } from '../../utils/flatten'
import {
  CollectionReference,
  DocumentSnapshot,
  Firestore,
  Query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from '../types'
import { QueryParams, ViewStore } from './types'

const createQuery = (
  db: Firestore,
  collection: string,
  params?: QueryParams,
): Query => {
  let query: Query = db.collection(collection)

  if (params?.where) {
    for (const { field, op, value } of params.where) {
      query = query.where(field, op, value)
    }
  }

  if (params?.orderBy) {
    for (const { field, direction } of params.orderBy) {
      query = query.orderBy(field, direction)
    }
  }

  if (params?.startAt) {
    query = query.startAt(...params.startAt)
  }

  if (params?.startAfter) {
    query = query.startAfter(...params.startAfter)
  }

  if (params?.endAt) {
    query = query.endAt(...params.endAt)
  }

  if (params?.endBefore) {
    query = query.endBefore(...params.endBefore)
  }

  if (params?.limit) {
    query = query.limit(params.limit)
  }

  if (params?.limitToLast) {
    query = query.limitToLast(params.limitToLast)
  }

  return query
}

export const generateId = (
  someRandomCollection: CollectionReference,
): ViewStore['generateId'] => {
  return () => someRandomCollection.doc().id
}

export const exists = (db: Firestore): ViewStore['exists'] => {
  return async (collection, id) => {
    const docSnap = await db.collection(collection).doc(id).get()
    return docSnap.exists
  }
}

export const get = (db: Firestore): ViewStore['get'] => {
  return async (collection, id) => {
    const docSnap = await db.collection(collection).doc(id).get()
    return (docSnap.data() ?? null) as any
  }
}

export const getAndObserve = (db: Firestore): ViewStore['getAndObserve'] => {
  return (collection, id, onNext, onError) => {
    return db
      .collection(collection)
      .doc(id)
      .onSnapshot((docSnap: DocumentSnapshot) => {
        onNext((docSnap.data() ?? null) as any)
      }, onError)
  }
}

export const query = (db: Firestore): ViewStore['query'] => {
  return async (collection, params) => {
    const query = createQuery(db, collection, params)
    const querySnap = await query.get()
    const docs = querySnap.docs as QueryDocumentSnapshot[]
    return docs.map(docSnap => docSnap.data() as Event)
  }
}

export const queryAndObserve = (
  db: Firestore,
): ViewStore['queryAndObserve'] => {
  return (collection, params, onNext, onError) => {
    const query = createQuery(db, collection, params)
    return query.onSnapshot((querySnap: QuerySnapshot) => {
      const docs = querySnap.docs as QueryDocumentSnapshot[]
      onNext(docs.map(docSnap => docSnap.data() as Event))
    }, onError)
  }
}

export const create = (db: Firestore): ViewStore['create'] => {
  return async (collection, id, data) => {
    await db.collection(collection).doc(id).set(data)
  }
}

export const update = (db: Firestore): ViewStore['update'] => {
  return async (collection, id, data) => {
    await db.collection(collection).doc(id).update(flatten(data))
  }
}

export const updateOrCreate = (db: Firestore): ViewStore['updateOrCreate'] => {
  return async (collection, id, data) => {
    if (await exists(db)(collection, id)) {
      await update(db)(collection, id, data)
      return
    }

    await create(db)(collection, id, data)
  }
}

export const _delete = (db: Firestore): ViewStore['delete'] => {
  return async (collection, id) => {
    await db.collection(collection).doc(id).delete()
  }
}
