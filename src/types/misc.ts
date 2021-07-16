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
