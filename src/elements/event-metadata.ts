import type { Timestamp } from '../stores/view-store'

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: Timestamp
  revision: number
  userId?: string
}
