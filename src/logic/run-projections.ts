import { ApplicationDefinition } from '../types/application'
import { Event } from '../types/event'
import { getFullyQualifiedEventName } from '../utils/get-fully-qualified-event-name'

export const runProjections = async (
  applicationDefinition: ApplicationDefinition,
  event: Event,
): Promise<void> => {
  const fullyQualifiedEventName = getFullyQualifiedEventName(event)

  const promises: Array<Promise<void>> = []

  for (const [viewName, view] of Object.entries(applicationDefinition.views)) {
    for (const [handlerKey, handler] of Object.entries(view.projections)) {
      if (handlerKey === fullyQualifiedEventName) {
        const promise = handler(event)
          .then(() => {
            console.log(`Ran projection in '${viewName}'`)
          })
          .catch(error => {
            console.error(`Failed to run projection in '${viewName}'`, error)
          })

        promises.push(promise)
      }
    }
  }

  await Promise.all(promises)
}
