import firebase from 'firebase-admin'
import * as functions from 'firebase-functions'

import { createApplication } from '../../application'
import { ApplicationDefinition } from '../../types/application'

type CronJobFunctions = {
  [functionName: string]: functions.CloudFunction<any>
}

export const createCronJobFirebaseFunctions = (
  firebaseApp: firebase.app.App,
  applicationDefinition: ApplicationDefinition,
): CronJobFunctions => {
  const application = createApplication(firebaseApp, applicationDefinition)

  const cronJobFirebaseFunctions: CronJobFunctions = {}

  for (const [flowName, flow] of Object.entries(applicationDefinition.flows)) {
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
        const flowService = application.getFlowService({
          causationEvent: null,
        })

        await handler(flowService)
      })
  }

  return cronJobFirebaseFunctions
}
