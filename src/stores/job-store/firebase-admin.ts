import firebaseAdmin from 'firebase-admin'

import { Job } from '../../elements/job'
import { QueryDocumentSnapshot } from '../types'
import { JOBS } from './constants'
import { JobStore } from './types'

export const createFirebaseAdminJobStore = (
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
        .where('scheduledFor', '<=', firebaseAdmin.firestore.Timestamp.now())

      const querySnap = await query.get()
      const docs = querySnap.docs as QueryDocumentSnapshot[]
      return docs.map(docSnap => docSnap.data() as Job<any>)
    },

    saveCommandJob: async ({
      scheduledFor,
      aggregateName,
      aggregateId,
      commandName,
      commandData,
      causationId,
      correlationId,
    }) => {
      const jobId = generateId()

      const job: Job = {
        id: jobId,
        scheduledFor: firebaseAdmin.firestore.Timestamp.fromDate(scheduledFor),
        status: 'scheduled',
        type: 'command',
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
