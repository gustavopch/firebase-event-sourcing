import type firebaseAdmin from 'firebase-admin'

import { Event } from '../elements/event'
import { createEventStore } from '../stores/event-store'
import { createViewStore } from '../stores/view-store'
import { mapValues } from '../utils/map-values'
import { RemoveFirstFromTuple } from '../utils/types'
import { ApplicationDefinition } from './definitions/application-definition'
import { createProjectionsTriggerer } from './projections-triggerer'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const loadApp = <TApplicationDefinition extends ApplicationDefinition>(
  firebaseApp: firebase.app.App | firebaseAdmin.app.App,
  application: TApplicationDefinition,
) => {
  const viewStore = createViewStore(firebaseApp)
  const eventStore = createEventStore(firebaseApp)

  const triggerProjections = createProjectionsTriggerer(
    firebaseApp,
    application.views,
  )

  return {
    ...((mapValues(application.domain, context => {
      return mapValues(context, (aggregate, aggregateName) => {
        return mapValues(aggregate.commands, handler => {
          type CommandData = Parameters<typeof handler>[0]

          return async (aggregateId: string, commandData: CommandData) => {
            const { name, data } = handler(commandData)

            const event = await eventStore.saveEvent({
              aggregateName,
              aggregateId,
              name,
              data,
            })

            return event
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

    views: (mapValues(application.views, view => {
      return mapValues(view.queries, query => query.bind(null, viewStore))
    }) as any) as {
      [viewName in keyof TApplicationDefinition['views']]: {
        [queryName in keyof TApplicationDefinition['views'][viewName]['queries']]: (
          ...args: RemoveFirstFromTuple<Parameters<TApplicationDefinition['views'][viewName]['queries'][queryName]>> // prettier-ignore
        ) => ReturnType<TApplicationDefinition['views'][viewName]['queries'][queryName]> // prettier-ignore
      }
    },

    replayEvents: async (fromTimestamp = new Date(0)): Promise<void> => {
      await eventStore.getReplay(fromTimestamp, async event => {
        await triggerProjections(event)
      })
    },

    importEvents: eventStore.importEvents,
  }
}
