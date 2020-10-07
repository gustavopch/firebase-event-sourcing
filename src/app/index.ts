import firebase from 'firebase-admin'
import { createAggregatesService } from '../services/aggregates-service'

import { FlowService, createFlowService } from '../services/flow-service'
import { createEventStore } from '../stores/event-store'
import { AppDefinition } from '../types/app'
import { CommandWithMetadata } from '../types/command'
import { Event } from '../types/event'
import { getFullyQualifiedEventName } from '../utils/get-fully-qualified-event-name'

export type App = {
  dispatch: (command: CommandWithMetadata) => Promise<{ eventId: string }>
  replayEvents: () => Promise<void>
  getFlowService: (params: { causationEvent: Event | null }) => FlowService
}

export const createApp = (
  firebaseApp: firebase.app.App,
  appDefinition: AppDefinition,
): App => {
  const eventStore = createEventStore(firebaseApp)
  const aggregatesService = createAggregatesService(eventStore)

  const runProjections = async (event: Event) => {
    const fullyQualifiedEventName = getFullyQualifiedEventName(event)

    const promises: Array<Promise<void>> = []

    for (const [viewName, view] of Object.entries(appDefinition.views)) {
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

    for (const [flowName, flow] of Object.entries(appDefinition.flows)) {
      const reactions = flow.reactions ?? {}
      for (const [handlerKey, handler] of Object.entries(reactions)) {
        if (handlerKey === fullyQualifiedEventName) {
          const flowService = getFlowService({
            causationEvent: event,
          })

          const promise = handler(event, { flow: flowService })
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

  const dispatch: App['dispatch'] = async command => {
    const aggregateDefinition = appDefinition.domain[command.contextName]?.[command.aggregateName] // prettier-ignore
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

    const aggregate = await eventStore.getAggregate(command.aggregateId)
    const { name: eventName, data: eventData } = commandDefinition.handle(aggregate?.state ?? null, command, { aggregates: aggregatesService }) // prettier-ignore

    const initialState = aggregateDefinition.getInitialState?.() ?? {}
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
      initialState,
      (state, event) => {
        const eventDefinition = aggregateDefinition.events?.[event.name]
        return eventDefinition?.handle?.(state, event) ?? {}
      },
    )

    const event = (await eventStore.getEvent(eventId))!
    console.log('Saved event:', event)

    await runProjections(event)

    await runReactions(event)

    return { eventId }
  }

  const replayEvents: App['replayEvents'] = async () => {
    await eventStore.getReplay(0, async event => {
      await runProjections(event)
    })
  }

  const getFlowService: App['getFlowService'] = ({ causationEvent }) => {
    return createFlowService(dispatch, causationEvent)
  }

  return {
    dispatch,
    replayEvents,
    getFlowService,
  }
}
