import type firebaseAdmin from 'firebase-admin'

import { Event } from '../elements/event'
import { createFlowManager } from '../services/flow-manager'
import { createEventStore } from '../stores/event-store'
import { createJobStore } from '../stores/job-store'
import { FlowsDefinition } from './definitions/flows-definition'

type TriggerReactionsFn = (event: Event) => Promise<void>

export const createReactionsTriggerer = (
  firebaseAdminApp: firebaseAdmin.app.App,
  flows: FlowsDefinition,
  causationEvent: Event | null,
): TriggerReactionsFn => {
  const eventStore = createEventStore(firebaseAdminApp)
  const jobStore = createJobStore(firebaseAdminApp)

  const flowManager = createFlowManager(eventStore, jobStore, causationEvent)

  return async event => {
    const promises = []

    for (const flow of Object.values(flows)) {
      for (const [name, handler] of Object.entries(flow.reactions ?? {})) {
        if (name === event.name) {
          promises.push(handler(flowManager, event))
        }
      }
    }

    await Promise.all(promises)
  }
}
