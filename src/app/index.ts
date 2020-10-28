import firebase from 'firebase-admin'
import { createAggregatesService } from '../services/aggregates-service'

import { FlowService, createFlowService } from '../services/flow-service'
import { createEventStore } from '../stores/event-store'
import { AppDefinition } from '../types/app'
import { CommandMetadata } from '../types/command'
import { Event } from '../types/event'
import { getFullyQualifiedEventName } from '../utils/get-fully-qualified-event-name'

export type App<TAppDefinition extends AppDefinition> = {
  dispatch: <
    TContextName extends keyof TAppDefinition['domain'] & string,
    TAggregateName extends keyof TAppDefinition['domain'][TContextName] & string, // prettier-ignore
    TCommandName extends keyof TAppDefinition['domain'][TContextName][TAggregateName]['commands'] & string // prettier-ignore
  >(
    contextName: TContextName,
    aggregateName: TAggregateName,
    commandName: TCommandName,
    aggregateId: string,
    data: Parameters<TAppDefinition['domain'][TContextName][TAggregateName]['commands'][TCommandName]['handle']>[1]['data'], // prettier-ignore
    metadata?: CommandMetadata,
  ) => Promise<{ eventIds: string[] }>
  replayEvents: () => Promise<void>
  getFlowService: (params: { causationEvent: Event | null }) => FlowService
}

export const createApp = <TAppDefinition extends AppDefinition>(
  firebaseApp: firebase.app.App,
  appDefinition: TAppDefinition,
): App<TAppDefinition> => {
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

  const dispatch: App<TAppDefinition>['dispatch'] = async (
    contextName,
    aggregateName,
    commandName,
    aggregateId,
    data,
    metadata,
  ) => {
    const aggregateDefinition = appDefinition.domain[contextName]?.[aggregateName] // prettier-ignore
    if (!aggregateDefinition) {
      const error = new Error()
      error.name = 'AggregateNotFound'
      error.message = `Aggregate '${contextName}.${aggregateName}' not found`
      throw error
    }

    const commandDefinition = aggregateDefinition.commands[commandName]
    if (!commandDefinition) {
      const error = new Error()
      error.name = 'CommandHandlerNotFound'
      error.message = `Command handler for '${contextName}.${aggregateName}.${commandName}' not found`
      throw error
    }

    const command = {
      contextName,
      aggregateName,
      aggregateId,
      name: commandName,
      data,
    }

    const isAuthorized = (await commandDefinition.isAuthorized?.(command)) ?? true // prettier-ignore
    if (!isAuthorized) {
      const error = new Error()
      error.name = 'Unauthorized'
      error.message = 'Unauthorized'
      throw error
    }

    const aggregate = await eventStore.getAggregate(aggregateId)
    const eventOrEventsProps = await commandDefinition.handle(aggregate?.state ?? null, command, { aggregates: aggregatesService }) // prettier-ignore
    const eventsProps = Array.isArray(eventOrEventsProps)
      ? eventOrEventsProps
      : [eventOrEventsProps]

    const initialState = aggregateDefinition.getInitialState?.() ?? {}
    const eventIds: string[] = []
    for (const { name: eventName, data: eventData } of eventsProps) {
      const eventId = await eventStore.saveEvent(
        {
          contextName,
          aggregateName,
          aggregateId,
          name: eventName,
          data: eventData,
          causationId: metadata?.causationId ?? null,
          correlationId: metadata?.correlationId ?? null,
          client: metadata?.client ?? null,
        },
        initialState,
        (state, event) => {
          const eventDefinition = aggregateDefinition.events?.[event.name]
          return eventDefinition?.handle?.(state, event) ?? {}
        },
      )

      eventIds.push(eventId)
      const event = (await eventStore.getEvent(eventId))!
      console.log('Saved event:', event)

      await runProjections(event)

      await runReactions(event)
    }

    return { eventIds }
  }

  const replayEvents: App<TAppDefinition>['replayEvents'] = async () => {
    await eventStore.getReplay(0, async event => {
      await runProjections(event)
    })
  }

  const getFlowService: App<TAppDefinition>['getFlowService'] = ({
    causationEvent,
  }) => {
    return createFlowService(
      command =>
        dispatch(
          command.contextName,
          command.aggregateName,
          command.name,
          command.aggregateId,
          command.data,
          command.metadata,
        ),
      causationEvent,
    )
  }

  return {
    dispatch,
    replayEvents,
    getFlowService,
  }
}
