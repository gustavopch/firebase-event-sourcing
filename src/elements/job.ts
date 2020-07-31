import type { Timestamp } from '../stores/view-store'
import { CommandData } from './command-data'

export type JobStatus = 'scheduled' | 'done' | 'failed'

export type Job<TCommandData extends CommandData = CommandData> = {
  id: string
  scheduledFor: Timestamp
  status: JobStatus
} & {
  type: 'command'
  aggregateName: string
  aggregateId: string
  commandName: string
  commandData: TCommandData
  causationId?: string
  correlationId?: string
}
