import firebase from 'firebase-admin'

import { FlowService, createFlowService } from '../services/flow-service'
import { createEventStore } from '../stores/event-store'
import { ApplicationDefinition } from '../types/application'
import { CommandWithMetadata } from '../types/command'
import { Event } from '../types/event'
import { getFullyQualifiedEventName } from '../utils/get-fully-qualified-event-name'

export type Application = {
  dispatch: (command: CommandWithMetadata) => Promise<{ eventId: string }>
  replayEvents: () => Promise<void>
  getFlowService: (params: { causationEvent: Event | null }) => FlowService
}

export const createApplication = (
  firebaseApp: firebase.app.App,
  applicationDefinition: ApplicationDefinition,
): Application => {
  const eventStore = createEventStore(firebaseApp)

  const runProjections = async (event: Event) => {
    const fullyQualifiedEventName = getFullyQualifiedEventName(event)

    const promises: Array<Promise<void>> = []

    // prettier-ignore
    for (const [viewName, view] of Object.entries(applicationDefinition.views)) {
      for (const [handlerKey, handler] of Object.entries(view.projections)) {
        if (handlerKey === fullyQualifiedEventName) {
          const promise = handler(event)
            .then(() => {
              console.log(`Ran '${viewName}' projection with event '${fullyQualifiedEventName}:${event.id}'`) // prettier-ignore
            })
            .catch(error => {
              console.error(`Failed to run '${viewName}' projection with event '${fullyQualifiedEventName}:${event.id}':`, error) // prettier-ignore
            })

          promises.push(promise)
        }
      }
    }

    await Promise.all(promises)
  }

  const runReactions = async (event: Event) => {
    const fullyQualifiedEventName = getFullyQualifiedEventName(event)

    const promises: Array<Promise<void>> = []

    // prettier-ignore
    for (const [flowName, flow] of Object.entries(applicationDefinition.flows)) {
      const reactions = flow.reactions ?? {}
      for (const [handlerKey, handler] of Object.entries(reactions)) {
        if (handlerKey === fullyQualifiedEventName) {
              const flowService = getFlowService({
                causationEvent: event,
              })

          const promise = handler(flowService, event)
            .then(() => {
              console.log(`Ran '${flowName}' reaction with event '${fullyQualifiedEventName}:${event.id}'`) // prettier-ignore
            })
            .catch(error => {
              console.error(`Failed to run '${flowName}' reaction with event '${fullyQualifiedEventName}:${event.id}':`, error) // prettier-ignore
            })

          promises.push(promise)
        }
      }
    }

    await Promise.all(promises)
  }

  const dispatch: Application['dispatch'] = async command => {
    const aggregateDefinition = applicationDefinition.domain[command.contextName]?.[command.aggregateName] // prettier-ignore
    if (!aggregateDefinition) {
      const error = new Error()
      error.name = 'AggregateNotFound'
      error.message = `Aggregate '${command.contextName}.${command.aggregateName}' not found`
      throw error
    }

    const commandDefinition = aggregateDefinition.commands[command.name]
    if (!commandDefinition) {
      const error = new Error()
      error.name = 'CommandHandlerNotFound'
      error.message = `Command handler for '${command.contextName}.${command.aggregateName}.${command.name}' not found`
      throw error
    }

    const isAuthorized = (await commandDefinition.isAuthorized?.(command)) ?? true // prettier-ignore
    if (!isAuthorized) {
      const error = new Error()
      error.name = 'Unauthorized'
      error.message = 'Unauthorized'
      throw error
    }

    const { name: eventName, data: eventData } = commandDefinition.handle(command) // prettier-ignore

    const eventId = await eventStore.saveEvent(
      {
        contextName: command.contextName,
        aggregateName: command.aggregateName,
        aggregateId: command.aggregateId,
        name: eventName,
        data: eventData,
        causationId: command.metadata.causationId,
        correlationId: command.metadata.correlationId,
        client: command.metadata.client,
      },
      event => {
        const eventDefinition = aggregateDefinition.events?.[event.name]
        return eventDefinition?.handle?.(event) ?? {}
      },
    )

    const event = (await eventStore.getEvent(eventId))!
    console.log('Saved event:', event)

    await runProjections(event)

    await runReactions(event)

    return { eventId }
  }

  const replayEvents: Application['replayEvents'] = async () => {
    await eventStore.getReplay(0, async event => {
      await runProjections(event)
    })
  }

  const getFlowService: Application['getFlowService'] = ({
    causationEvent,
  }) => {
    return createFlowService(dispatch, causationEvent)
  }

  return {
    dispatch,
    replayEvents,
    getFlowService,
  }
}
