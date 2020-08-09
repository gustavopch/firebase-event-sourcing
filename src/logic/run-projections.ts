import { ViewsDefinition } from '../application/views-definition'
import { Event } from '../elements/event'

export const runProjections = async (
  views: ViewsDefinition,
  event: Event,
): Promise<void> => {
  const fullyQualifiedEventName = `${event.contextName}.${event.aggregateName}.${event.name}`

  const promises: Array<Promise<void>> = []

  for (const [viewName, view] of Object.entries(views)) {
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