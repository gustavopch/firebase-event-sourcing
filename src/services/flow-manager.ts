import { CommandHandler } from '../elements/command-handler'
import { Event } from '../elements/event'
import { QueryHandler } from '../elements/query-handler'
import { EventStore } from '../stores/event-store'
import { JobStore } from '../stores/job-store'
import { ViewStore } from '../stores/view-store'
import { RemoveFirstFromTuple } from '../utils/types'

const getAggregateNameFromEventName = (eventName: string): string => {
  return eventName.split('.').slice(0, 2).join('.')
}

export type FlowManager = {
  runQuery: <TQueryHandler extends QueryHandler>(
    handler: TQueryHandler,
    ...args: RemoveFirstFromTuple<Parameters<TQueryHandler>>
  ) => ReturnType<TQueryHandler>

  runCommand: <TCommandHandler extends CommandHandler<any>>(
    handler: TCommandHandler,
    aggregateId: string,
    commandData: Parameters<TCommandHandler>[0],
  ) => Promise<void>

  scheduleCommand: <TCommandHandler extends CommandHandler<any>>(
    date: Date | string | number,
    handler: TCommandHandler,
    aggregateId: string,
    commandData: Parameters<TCommandHandler>[0],
  ) => Promise<void>
}

export const createFlowManager = (
  eventStore: EventStore,
  jobStore: JobStore,
  viewStore: ViewStore,
  causationEvent: Event | null,
): FlowManager => {
  return {
    runQuery: (handler, ...args) => {
      return handler(viewStore, ...args)
    },

    runCommand: async (handler, aggregateId, commandData) => {
      const event = handler(commandData)
      const aggregateName = getAggregateNameFromEventName(event.name)

      await eventStore.saveNewEvent({
        aggregateName,
        aggregateId,
        name: event.name,
        data: event.data,
        causationId: causationEvent?.id,
        correlationId: causationEvent?.metadata.correlationId,
      })
    },

    scheduleCommand: async (date, handler, aggregateId, commandData) => {
      const event = handler(commandData)
      const aggregateName = getAggregateNameFromEventName(event.name)

      await jobStore.saveCommandJob({
        scheduledFor: new Date(date),
        aggregateName,
        aggregateId,
        commandName: handler.name,
        commandData: commandData,
        causationId: causationEvent?.id,
        correlationId: causationEvent?.metadata.correlationId,
      })
    },
  }
}
