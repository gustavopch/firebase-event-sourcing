import firebaseAdmin from 'firebase-admin'
import * as functions from 'firebase-functions'

import { FlowsDefinition } from '../../application/definitions/flows-definition'
import { createFlowManager } from '../../services/flow-manager'
import { createEventStore } from '../../stores/event-store'
import { createJobStore } from '../../stores/job-store'
import { createViewStore } from '../../stores/view-store'

type CronJobFunctions = {
  [functionName: string]: functions.CloudFunction<any>
}

export const createCronJobFirebaseFunctions = (
  firebaseAdminApp: firebaseAdmin.app.App,
  flows: FlowsDefinition,
): CronJobFunctions => {
  const eventStore = createEventStore(firebaseAdminApp)
  const jobStore = createJobStore(firebaseAdminApp)
  const viewStore = createViewStore(firebaseAdminApp)
  const flowManager = createFlowManager(eventStore, jobStore, viewStore, null)

  const cronJobFirebaseFunctions: CronJobFunctions = {}

  for (const [flowName, flow] of Object.entries(flows)) {
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
        await handler(flowManager)
      })
  }

  return cronJobFirebaseFunctions
}
