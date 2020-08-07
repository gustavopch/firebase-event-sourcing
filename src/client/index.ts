import { ApplicationDefinition } from '../application/definitions/application-definition'
import { Event } from '../elements/event'
import { mapValues } from '../utils/map-values'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createClient = <
  TApplicationDefinition extends ApplicationDefinition
>(
  application: TApplicationDefinition,
  options: {
    baseUrl: string
  },
) => {
  return {
    ...((mapValues(application.domain, context => {
      return mapValues(context, (aggregate, aggregateName) => {
        return mapValues(aggregate.commands, (commandHandler, commandName) => {
          type CommandData = Parameters<typeof commandHandler>[0]

          return async (aggregateId: string, commandData: CommandData) => {
            const url = `${options.baseUrl}/${commandName}`
            const res = await window.fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                aggregateName,
                aggregateId,
                name: commandName,
                data: commandData,
              }),
            })

            if (!res.ok) {
              throw new Error('Command rejected')
            }

            return res.json()
          }
        })
      })
    }) as any) as {
      [contextName in keyof TApplicationDefinition['domain']]: {
        [aggregateName in keyof TApplicationDefinition['domain'][contextName]]: {
          [commandName in keyof TApplicationDefinition['domain'][contextName][aggregateName]['commands']]: (
            aggregateId: string,
            commandData: Parameters<TApplicationDefinition['domain'][contextName][aggregateName]['commands'][commandName]>[0], // prettier-ignore
          ) => Promise<Event<ReturnType<TApplicationDefinition['domain'][contextName][aggregateName]['commands'][commandName]>['data']>> // prettier-ignore
        }
      }
    }),
  }
}
