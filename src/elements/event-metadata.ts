import { ClientInfo } from './client-info'

export type EventMetadata = {
  causationId: string
  correlationId: string
  timestamp: number
  revision: number
  client: ClientInfo | null
}
