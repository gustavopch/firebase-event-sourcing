// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const mapValues = <TObject extends { [key: string]: any }, TResult>(
  object: TObject,
  fn: (value: TObject[keyof TObject], key: string) => TResult,
) => {
  return Object.entries(object).reduce((acc, [key, value]) => {
    acc[key as keyof TObject] = fn(value, key)
    return acc
  }, {} as { [key in keyof TObject]: TResult })
}
