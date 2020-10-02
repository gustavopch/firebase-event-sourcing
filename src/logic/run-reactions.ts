import { ApplicationDefinition } from '../application/application-definition'
import { Event } from '../elements/event'
import { createFlowManager } from '../services/flow-manager'
import { EventStore } from '../stores/event-store'
import { getFullyQualifiedEventName } from '../utils/get-fully-qualified-event-name'

export const runReactions = async (
  eventStore: EventStore,
  application: ApplicationDefinition,
  event: Event,
): Promise<void> => {
  const flowManager = createFlowManager(eventStore, application, event)

  const fullyQualifiedEventName = getFullyQualifiedEventName(event)

  const promises: Array<Promise<void>> = []

  for (const [flowName, flow] of Object.entries(application.flows)) {
    const reactions = flow.reactions ?? {}
    for (const [handlerKey, handler] of Object.entries(reactions)) {
      if (handlerKey === fullyQualifiedEventName) {
        const promise = handler(flowManager, event)
          .then(() => {
            console.log(`Ran reaction in '${flowName}'`)
          })
          .catch(error => {
            console.error(`Failed to run reaction in '${flowName}'`, error)
          })

        promises.push(promise)
      }
    }
  }

  await Promise.all(promises)
}
