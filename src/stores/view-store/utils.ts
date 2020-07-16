const isPlainObject = (value: any): boolean => {
  if (typeof value !== 'object') {
    return false
  }

  if (value === null) {
    return false
  }

  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export const flatten = <T extends { [key: string]: any }>(
  object: T,
  path?: string,
): T => {
  return Object.keys(object).reduce((acc: T, key: string): T => {
    const newPath = [path, key].filter(Boolean).join('.')
    return isPlainObject(object[key]) && Object.keys(object[key]).length > 0
      ? { ...acc, ...flatten(object[key], newPath) }
      : { ...acc, [newPath]: object[key] }
  }, {} as T)
}
