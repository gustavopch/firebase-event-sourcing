import firebase from 'firebase-admin'

import { Command, CommandWithMetadata } from '../types/command'
import { Event } from '../types/event'

export type FlowService = ReturnType<typeof createFlowService>

export const createFlowService = (
  dispatch: (command: CommandWithMetadata) => Promise<unknown>,
  causationEvent: Event | null,
) => {
  return {
    dispatch: async <TCommand extends Command>(
      command: TCommand,
    ): Promise<void> => {
      await dispatch({
        ...command,
        metadata: {
          causationId: causationEvent?.id ?? null,
          correlationId: causationEvent?.metadata.correlationId ?? null,
          userId: 'system',
          timestamp: firebase.firestore.Timestamp.now(),
          client: null,
        },
      })
    },
  }
}
