import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { createFlowService } from '../../services/flow-service'
import { createEventStore } from '../../stores/event-store'
import { ApplicationDefinition } from '../../types/application'

type CronJobFunctions = {
  [functionName: string]: functions.CloudFunction<any>
}

export const createCronJobFirebaseFunctions = (
  firebaseAdminApp: firebaseAdmin.app.App,
  application: ApplicationDefinition,
): CronJobFunctions => {
  const eventStore = createEventStore(firebaseAdminApp)
  const flowService = createFlowService(eventStore, application, null)

  const cronJobFirebaseFunctions: CronJobFunctions = {}

  for (const [flowName, flow] of Object.entries(application.flows)) {
    const [firstEntry, ...ignoredEntries] = Object.entries(flow.cron ?? {})

    if (!firstEntry) {
      // No cron jobs defined in this flow
      continue
    }

    const [schedule, handler] = firstEntry

    if (ignoredEntries.length > 0) {
      console.error(
        'A single cron job is allowed per flow because the generated Cloud ' +
          'Function will be named according to the name of the flow and we ' +
          'must not have two Cloud Functions with the same name. Ignored: ' +
          ignoredEntries.map(([schedule]) => `'${schedule}'`).join(', '),
      )
    }

    cronJobFirebaseFunctions[flowName] = functions.pubsub
      .schedule(schedule)
      .onRun(async ctx => {
        await handler(flowService)
      })
  }

  return cronJobFirebaseFunctions
}
