import { processCommand } from '../logic/process-command'
import { EventStore } from '../stores/event-store'
import { ApplicationDefinition } from '../types/application'
import { Command } from '../types/command'
import { Event } from '../types/event'

export type FlowService = {
  dispatch: <TCommand extends Command>(command: TCommand) => Promise<void>
}

export const createFlowService = (
  eventStore: EventStore,
  application: ApplicationDefinition,
  causationEvent: Event | null,
): FlowService => {
  return {
    dispatch: async command => {
      await processCommand(eventStore, application, {
        ...command,
        metadata: {
          causationId: causationEvent?.id ?? null,
          correlationId: causationEvent?.metadata.correlationId ?? null,
          client: null,
        },
      })
    },
  }
}
