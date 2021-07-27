import firebase from 'firebase-admin'

import { AggregatesService } from './services/aggregates'
import { FlowService, createFlowService } from './services/flow'
import { LoggerService } from './services/logger'
import { ProjectionsService } from './services/projections'
import { EventStore } from './stores/event-store'
import { AppDefinition } from './types/app'
import { CommandMetadata } from './types/command'
import { Event } from './types/event'
import { Services } from './types/service'
import { getFullyQualifiedEventName } from './utils/get-fully-qualified-event-name'

export type App<TAppDefinition extends AppDefinition> = {
  dispatch: <
    TAggregateName extends keyof TAppDefinition['domain'] & string,
    TCommandName extends keyof TAppDefinition['domain'][TAggregateName]['commands'] & string, // prettier-ignore
  >(
    aggregateName: TAggregateName,
    commandName: TCommandName,
    aggregateId: string,
    data: Parameters<TAppDefinition['domain'][TAggregateName]['commands'][TCommandName]['handle']>[1]['data'], // prettier-ignore
    metadata: CommandMetadata,
  ) => Promise<{ eventIds: string[] }>
  replayEvents: () => Promise<void>
  getFlowService: (params: { causationEvent: Event | null }) => FlowService
}

export const createApp = <TAppDefinition extends AppDefinition>(
  firebaseApp: firebase.app.App,
  appDefinition: TAppDefinition,
  eventStore: EventStore,
  services: {
    aggregates: AggregatesService
    logger: LoggerService
    projections: ProjectionsService
    userland: Services
  },
): App<TAppDefinition> => {
  const runProjections = async (event: Event) => {
    const fullyQualifiedEventName = getFullyQualifiedEventName(event)

    await firebaseApp
      .firestore()
      // eslint-disable-next-line @typescript-eslint/require-await
      .runTransaction(async transaction => {
        for (const [viewName, view] of Object.entries(appDefinition.views)) {
          for (const [handlerKey, handler] of Object.entries(
            view.projections,
          )) {
            if (handlerKey === fullyQualifiedEventName) {
              const stateOrStatesWithTheirIds = handler(event, {
                logger: services.logger,
                projections: services.projections,
                ...services.userland,
              })

              const statesWithTheirIds = Array.isArray(
                stateOrStatesWithTheirIds,
              )
                ? stateOrStatesWithTheirIds
                : [{ id: event.aggregateId, state: stateOrStatesWithTheirIds }]

              for (const { id, state } of statesWithTheirIds) {
                const ref = firebaseApp.firestore().collection(viewName).doc(id)

                if (state) {
                  transaction.set(ref, state, { merge: true })
                } else {
                  transaction.delete(ref)
                }
              }

              console.log(`Trying to run '${viewName}' projection with event '${fullyQualifiedEventName}:${event.id}'`) // prettier-ignore
            }
          }
        }
      })
      .then(() => {
        console.info('Ran transaction of projections')
      })
      .catch(error => {
        console.error('Failed to run transaction of projections:', error)
      })
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

          const promise = handler(event, {
            flow: flowService,
            logger: services.logger,
            ...services.userland,
          })
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
    aggregateName,
    commandName,
    aggregateId,
    data,
    metadata,
  ) => {
    const aggregateDefinition = appDefinition.domain?.[aggregateName]
    if (!aggregateDefinition) {
      const error = new Error()
      error.name = 'AggregateNotFound'
      error.message = `Aggregate '${aggregateName}' not found`
      throw error
    }

    const commandDefinition = aggregateDefinition.commands[commandName]
    if (!commandDefinition) {
      const error = new Error()
      error.name = 'CommandHandlerNotFound'
      error.message = `Command handler for '${aggregateName}.${commandName}' not found`
      throw error
    }

    const command = {
      aggregateName,
      aggregateId,
      name: commandName,
      data,
      metadata,
    }

    const isAuthorized = (await commandDefinition.isAuthorized?.(command)) ?? true // prettier-ignore
    if (!isAuthorized) {
      const error = new Error()
      error.name = 'Unauthorized'
      error.message = 'Unauthorized'
      throw error
    }

    const aggregate = await eventStore.getAggregate(aggregateId)

    const eventOrEventsProps = await commandDefinition.handle(
      aggregate
        ? {
            id: aggregateId,
            revision: aggregate.revision,
            exists: true,
            state: aggregate.state,
          }
        : {
            id: aggregateId,
            revision: 0,
            exists: false,
            state: {},
          },
      command,
      {
        aggregates: services.aggregates,
        logger: services.logger,
        ...services.userland,
      },
    )

    const eventsProps = Array.isArray(eventOrEventsProps)
      ? eventOrEventsProps
      : [eventOrEventsProps]

    const initialState = aggregateDefinition.getInitialState?.() ?? {}
    const eventIds: string[] = []
    for (const { name: eventName, data: eventData } of eventsProps) {
      const eventId = await eventStore.saveEvent(
        {
          aggregateName,
          aggregateId,
          name: eventName,
          data: eventData,
          causationId: metadata.causationId,
          correlationId: metadata.correlationId,
          userId: metadata.userId,
          client: metadata.client,
        },
        initialState,
        (state, event) => {
          const eventDefinition = aggregateDefinition.events?.[event.name]

          const newState = eventDefinition?.handle?.(
            aggregate
              ? { id: aggregateId, state: aggregate.state }
              : { id: aggregateId, state: {} },
            event,
          )

          return newState ?? {}
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
