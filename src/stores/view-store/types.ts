export type Unsubscribe = () => void

export type FieldValue = {
  isEqual: (other: FieldValue) => boolean
}

export type GeoPoint = {
  readonly latitude: number
  readonly longitude: number
  isEqual: (other: GeoPoint) => boolean
}

export type Timestamp = {
  readonly seconds: number
  readonly nanoseconds: number
  toDate: () => Date
  toMillis: () => number
  isEqual: (other: Timestamp) => boolean
  valueOf: () => string
}

export type QueryDirection = 'asc' | 'desc'

export type QueryOperator =
  | '<'
  | '<='
  | '=='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'

export type QueryParams = {
  where?: Array<{ field: string; op: QueryOperator; value: any }>
  orderBy?: Array<{ field: string; direction: QueryDirection }>
  startAt?: any[]
  startAfter?: any[]
  endAt?: any[]
  endBefore?: any[]
  limit?: number
  limitToLast?: number
}

export type ViewStore = {
  values: {
    arrayRemove: (...elements: any[]) => FieldValue
    arrayUnion: (...elements: any[]) => FieldValue
    delete: () => FieldValue
    geoPoint: (latitude: number, longitude: number) => GeoPoint
    increment: (n: number) => FieldValue
    serverTimestamp: () => FieldValue
    timestamp: (date?: Date | string) => Timestamp
  }

  generateId: () => string

  exists: (collection: string, id: string) => Promise<boolean>

  get: <T extends { [key: string]: any }>(
    collection: string,
    id: string,
  ) => Promise<T | null>

  getAndObserve: <T extends { [key: string]: any }>(
    collection: string,
    id: string,
    onNext: (doc: T | null) => void,
    onError?: (error: Error) => void,
  ) => Unsubscribe

  query: (
    collection: string,
    params?: QueryParams,
  ) => Promise<Array<{ [key: string]: any }>>

  queryAndObserve: (
    collection: string,
    params: QueryParams,
    onNext: (docs: Array<{ [key: string]: any }>) => void,
    onError?: (error: Error) => void,
  ) => Unsubscribe

  create: (
    collection: string,
    id: string,
    data: { [key: string]: any },
  ) => Promise<void>

  update: (
    collection: string,
    id: string,
    data: { [key: string]: any },
  ) => Promise<void>

  updateOrCreate: (
    collection: string,
    id: string,
    data: { [key: string]: any },
  ) => Promise<void>

  delete: (collection: string, id: string) => Promise<void>
}
