import firebaseAdmin from 'firebase-admin'

import { CommandData } from '../elements/command-data'
import { Job, JobStatus } from '../elements/job'

export const JOBS = 'jobs'

export type JobStore = {
  getPendingJobs: () => Promise<Array<Job<any>>>

  saveCommandJob: <TCommandData extends CommandData>(jobProps: {
    scheduledFor: Date | string | number
    contextName: string
    aggregateName: string
    aggregateId: string
    commandName: string
    commandData: TCommandData
    causationId?: string
    correlationId?: string
  }) => Promise<void>

  updateJobStatus: (id: string, status: JobStatus) => Promise<void>
}

export const createJobStore = (
  firebaseAdminApp: firebaseAdmin.app.App,
): JobStore => {
  const db = firebaseAdminApp.firestore()
  const jobsCollection = db.collection(JOBS)

  const generateId = (): string => {
    return jobsCollection.doc().id
  }

  return {
    getPendingJobs: async () => {
      const query = jobsCollection
        .where('status', '==', 'scheduled')
        .where('scheduledFor', '<=', Date.now())

      const querySnap = await query.get()
      return querySnap.docs.map(docSnap => docSnap.data() as Job<any>)
    },

    saveCommandJob: async ({
      scheduledFor,
      contextName,
      aggregateName,
      aggregateId,
      commandName,
      commandData,
      causationId,
      correlationId,
    }) => {
      scheduledFor = new Date(scheduledFor)

      const jobId = generateId()

      const job: Job = {
        id: jobId,
        scheduledFor: scheduledFor.getTime(),
        status: 'scheduled',
        type: 'command',
        contextName,
        aggregateName,
        aggregateId,
        commandName,
        commandData,
        causationId,
        correlationId,
      }

      await jobsCollection.doc(jobId).set(job)
    },

    updateJobStatus: async (id, status) => {
      await jobsCollection.doc(id).update({
        status,
      })
    },
  }
}
