import type { Timestamp } from '../stores/view-store'

export type EventStatus = 'pending' | 'approved' | 'rejected' | 'failed'

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: Timestamp
  revision: number
  status: EventStatus
  issuerId?: string
}
