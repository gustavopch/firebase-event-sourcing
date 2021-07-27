import firebase from 'firebase-admin'
import * as functions from 'firebase-functions'

import { createApp } from '../app'
import { createAggregatesService } from '../services/aggregates'
import { createLoggerService } from '../services/logger'
import { createProjectionsService } from '../services/projections'
import { createEventStore } from '../stores/event-store'
import { AppDefinition } from '../types/app'
import { Services } from '../types/service'

type PubsubFunctions = {
  [functionName: string]: functions.CloudFunction<any>
}

export const createPubsubFunctions = (
  firebaseApp: firebase.app.App,
  appDefinition: AppDefinition,
): PubsubFunctions => {
  const eventStore = createEventStore(firebaseApp)
  const aggregatesService = createAggregatesService(eventStore)
  const loggerService = createLoggerService(null)
  const projectionsService = createProjectionsService(firebaseApp)
  const userlandServices = (appDefinition.services?.({
    logger: loggerService,
  }) ?? {}) as Services

  const app = createApp(
    firebaseApp,
    appDefinition,
    eventStore,
    aggregatesService,
    loggerService,
    projectionsService,
    userlandServices,
  )

  const pubsubFunctions: PubsubFunctions = {}

  for (const [flowName, flow] of Object.entries(appDefinition.flows)) {
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

    pubsubFunctions[flowName] = functions.pubsub
      .schedule(schedule)
      .onRun(async ctx => {
        const flowService = app.getFlowService({
          causationEvent: null,
        })

        await handler({
          flow: flowService,
          logger: loggerService,
          ...userlandServices,
        })
      })
  }

  return pubsubFunctions
}
