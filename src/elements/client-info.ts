import { Location } from './location'

export type ClientInfo = {
  userId: string | null
  ip: string | null
  userAgent: string | null
  location: Location | null
}
