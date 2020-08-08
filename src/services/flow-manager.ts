import { Command } from '../elements/command'
import { CommandHandler } from '../elements/command-handler'
import { Event } from '../elements/event'
import { EventStore } from '../stores/event-store'
import { JobStore } from '../stores/job-store'

const getAggregateNameFromEventName = (eventName: string): string => {
  return eventName.split('.').slice(0, 2).join('.')
}

export type FlowManager = {
  runCommand: <TCommandHandler extends CommandHandler<Command, Event>>(
    handler: TCommandHandler,
    aggregateId: string,
    commandData: Parameters<TCommandHandler>[0],
  ) => Promise<void>

  scheduleCommand: <TCommandHandler extends CommandHandler<Command, Event>>(
    date: Date | string | number,
    handler: TCommandHandler,
    aggregateId: string,
    commandData: Parameters<TCommandHandler>[0],
  ) => Promise<void>
}

export const createFlowManager = (
  eventStore: EventStore,
  jobStore: JobStore,
  causationEvent: Event | null,
): FlowManager => {
  return {
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
      date = new Date(date)

      const event = handler(commandData)
      const aggregateName = getAggregateNameFromEventName(event.name)

      await jobStore.saveCommandJob({
        scheduledFor: date.getTime(),
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
