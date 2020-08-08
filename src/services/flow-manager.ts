import { Command } from '../elements/command'
import { CommandHandler } from '../elements/command-handler'
import { Event } from '../elements/event'
import { EventStore } from '../stores/event-store'
import { JobStore } from '../stores/job-store'

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
      const [contextName, aggregateName] = event.name.split('.')

      await eventStore.saveNewEvent({
        contextName,
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
      const [contextName, aggregateName] = event.name.split('.')

      await jobStore.saveCommandJob({
        scheduledFor: date.getTime(),
        contextName,
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
