import { Location } from './location'

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: number
  revision: number
  userId?: string
  ip?: string
  userAgent?: string
  location?: Location
}
