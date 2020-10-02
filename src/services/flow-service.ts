import { Command, CommandWithMetadata } from '../types/command'
import { Event } from '../types/event'

export type FlowService = {
  dispatch: <TCommand extends Command>(command: TCommand) => Promise<void>
}

export const createFlowService = (
  dispatch: (command: CommandWithMetadata) => Promise<{ eventId: string }>,
  causationEvent: Event | null,
): FlowService => {
  return {
    dispatch: async command => {
      await dispatch({
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
