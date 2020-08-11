import { ApplicationDefinition } from '../application/application-definition'
import { Command } from '../elements/command'
import { Event } from '../elements/event'
import { processCommand } from '../logic/process-command'
import { EventStore } from '../stores/event-store'

export type FlowManager = {
  runCommand: <TCommand extends Command>(command: TCommand) => Promise<void>
}

export const createFlowManager = (
  eventStore: EventStore,
  application: ApplicationDefinition,
  causationEvent: Event | null,
): FlowManager => {
  return {
    runCommand: async command => {
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
