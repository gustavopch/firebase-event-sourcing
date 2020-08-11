import { Location } from './location'

export type ClientInfo = {
  userId: string | null
  ip: string | null
  ua: string | null
  location: Location | null
}
