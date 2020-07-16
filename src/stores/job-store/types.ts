import { CommandData } from '../../elements/command-data'
import { Job, JobStatus } from '../../elements/job'

export type JobStore = {
  getPendingJobs: () => Promise<Array<Job<any>>>

  saveCommandJob: <TCommandData extends CommandData>(jobProps: {
    scheduledFor: Date
    aggregateName: string
    aggregateId: string
    handlerName: string
    commandData: TCommandData
    causationId?: string
    correlationId?: string
  }) => Promise<void>

  updateJobStatus: (id: string, status: JobStatus) => Promise<void>
}
