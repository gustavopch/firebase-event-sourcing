export type RemoveFirstFromTuple<T extends any[]> =
  T['length'] extends 0 ? [] : // prettier-ignore
  ((...b: T) => void) extends (a: any, ...b: infer I) => void ? I : [] // prettier-ignore
