import { Command } from '../elements/command'
import { CommandHandler } from '../elements/command-handler'
import { Event } from '../elements/event'
import { EventStore } from '../stores/event-store'

export type FlowManager = {
  runCommand: <TCommandHandler extends CommandHandler<Command, Event>>(
    handler: TCommandHandler,
    aggregateId: string,
    commandData: Parameters<TCommandHandler>[0],
  ) => Promise<void>
}

export const createFlowManager = (
  eventStore: EventStore,
  causationEvent: Event | null,
): FlowManager => {
  return {
    runCommand: async (handler, aggregateId, commandData) => {
      const event = handler(commandData)
      const [contextName, aggregateName] = event.name.split('.')

      await eventStore.saveEvent({
        contextName,
        aggregateName,
        aggregateId,
        name: event.name,
        data: event.data,
        causationId: causationEvent?.id ?? null,
        correlationId: causationEvent?.metadata.correlationId ?? null,
        client: null,
      })
    },
  }
}
