import { ClientInfo } from './client-info'

export type CommandMetadata = {
  causationId: string | null
  correlationId: string | null
  client: ClientInfo | null
}
