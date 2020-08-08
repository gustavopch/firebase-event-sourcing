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
      const {
        contextName,
        aggregateName,
        aggregateId,
        commandName,
        commandData,
        causationId,
        correlationId,
      } = job

      const handleCommand =
        domain[contextName][aggregateName].commands[commandName].handle

      const { name, data } = handleCommand(commandData)

      await eventStore.saveNewEvent({
        contextName,
        aggregateName,
        aggregateId,
        name,
        data,
        causationId,
        correlationId,
      })
    }
  })
}
