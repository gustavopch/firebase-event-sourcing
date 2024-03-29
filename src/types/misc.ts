export type Location = {
  city: string | null
  region: string | null
  country: string | null
  coordinates: {
    latitude: number
    longitude: number
  } | null
}

export type ClientInfo = {
  ip: string
  ua: string
  location: Location | null
}

export type Promisable<T> = T | Promise<T>

export type Split<
  TString extends string,
  TDelimiter extends string,
> = TString extends `${infer THead}${TDelimiter}${infer TTail}`
  ? [THead, ...Split<TTail, TDelimiter>]
  : [TString]
