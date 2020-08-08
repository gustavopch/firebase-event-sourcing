import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { DomainDefinition } from '../../application/domain-definition'
import { createEventStore } from '../../stores/event-store'
import { createJobStore } from '../../stores/job-store'

export const createProcessJobsFirebaseFunction = (
  firebaseAdminApp: firebaseAdmin.app.App,
  domain: DomainDefinition,
  options: { schedule: string } = { schedule: 'every 5 minutes' },
): functions.CloudFunction<functions.firestore.QueryDocumentSnapshot> => {
  return functions.pubsub.schedule(options.schedule).onRun(async ctx => {
    const eventStore = createEventStore(firebaseAdminApp)
    const jobStore = createJobStore(firebaseAdminApp)

    const pendingJobs = await jobStore.getPendingJobs()

    for (const job of pendingJobs) {
      const [contextName, aggregateName] = job.aggregateName.split('.')

      const handler =
        domain[contextName][aggregateName].commands[job.commandName]

      const { name, data } = handler(job.commandData)

      await eventStore.saveNewEvent({
        aggregateName,
        aggregateId: job.aggregateId,
        name,
        data,
        causationId: job.causationId,
        correlationId: job.correlationId,
      })
    }
  })
}
