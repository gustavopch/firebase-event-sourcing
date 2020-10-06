import { CloudTasksClient } from '@google-cloud/tasks'
import * as functions from 'firebase-functions'

import { Command, CommandWithMetadata } from '../types/command'
import { Event } from '../types/event'

export type FlowService = {
  dispatch: <TCommand extends Command>(command: TCommand) => Promise<void>
  schedule: <TCommand extends Command>(
    date: Date,
    command: TCommand,
  ) => Promise<string | null>
}

export const createFlowService = (
  dispatch: (command: CommandWithMetadata) => Promise<unknown>,
  causationEvent: Event | null,
): FlowService => {
  const { apiKey, location, queue } = functions.config()
  const { projectId } = JSON.parse(process.env.FIREBASE_CONFIG!)
  const tasksClient = new CloudTasksClient()

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

    schedule: async (date, command) => {
      if (!process.env.FIRESTORE_EMULATOR_HOST) {
        console.warn("Cant't schedule commands when running in the local emulator") // prettier-ignore
        return null
      }

      if (!apiKey) {
        console.warn("Missing the 'apiKey' environment configuration")
        return null
      }

      if (!location) {
        console.warn("Missing the 'location' environment configuration")
        return null
      }

      if (!queue) {
        console.warn("Missing the 'queue' environment configuration")
        return null
      }

      const [response] = await tasksClient.createTask({
        parent: tasksClient.queuePath(projectId, location, queue),
        task: {
          httpRequest: {
            httpMethod: 'POST',
            url: `https://${location}-${projectId}.cloudfunctions.net/commands`,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `ApiKey ${apiKey}`,
            },
            body: Buffer.from(
              JSON.stringify({
                ...command,
                metadata: {
                  causationId: causationEvent?.id ?? null,
                  correlationId: causationEvent?.metadata.correlationId ?? null,
                },
              }),
            ).toString('base64'),
          },
          scheduleTime: {
            seconds: date.getTime() / 1000,
          },
        },
      })

      return response.name!
    },
  }
}
