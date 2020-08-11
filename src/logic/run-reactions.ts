import { ApplicationDefinition } from '../application/application-definition'
import { Event } from '../elements/event'
import { createFlowManager } from '../services/flow-manager'
import { EventStore } from '../stores/event-store'

export const runReactions = async (
  eventStore: EventStore,
  application: ApplicationDefinition,
  event: Event,
): Promise<void> => {
  const flowManager = createFlowManager(eventStore, event)

  const fullyQualifiedEventName = `${event.contextName}.${event.aggregateName}.${event.name}`

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
