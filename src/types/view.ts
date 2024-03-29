import { Trigger } from '../constants'
import { LoggerService } from '../services/logger'
import { ProjectionsService } from '../services/projections'
import { Event, ExtractFullyQualifiedEventName } from './event'
import { Promisable, Split } from './misc'
import { Services } from './service'

export type ViewProjectionState = {
  [key: string]: any
}

export type ViewProjectionContext = Services & {
  logger: LoggerService
  projections: ProjectionsService
}

export type ViewProjectionHandler<
  TViewProjectionState extends ViewProjectionState,
  TEvent extends Event,
> = (
  event: TEvent,
  context: ViewProjectionContext,
) => Promisable<
  | Partial<TViewProjectionState>
  | null
  | Array<{
      id: string
      state: Partial<TViewProjectionState> | null
    }>
>

export type ViewReactionContext = Services & {
  logger: LoggerService
  projections: ProjectionsService
}

export type ViewReactionHandler<TParams extends any[]> = (
  ...params: [...params: TParams, context: ViewReactionContext]
) => Promise<void>

export type ViewDefinition<
  TViewProjectionState extends ViewProjectionState,
  TEvent extends Event,
> = {
  collectionName: string

  projections: {
    [eventName in ExtractFullyQualifiedEventName<TEvent>]: ViewProjectionHandler<
      TViewProjectionState,
      TEvent extends {
        aggregateName: Split<eventName, '.'>[0]
        name: Split<eventName, '.'>[1]
      }
        ? TEvent
        : never
    >
  }

  reactions?: {
    [Trigger.CREATE]?: ViewReactionHandler<[state: TViewProjectionState]>

    [Trigger.UPDATE]?: ViewReactionHandler<
      [
        change: {
          before: TViewProjectionState
          after: TViewProjectionState
        },
      ]
    >

    [Trigger.DELETE]?: ViewReactionHandler<[state: TViewProjectionState]>

    [Trigger.WRITE]?: ViewReactionHandler<
      [
        change:
          | {
              // Creating
              before: null
              after: TViewProjectionState
            }
          | {
              // Updating
              before: TViewProjectionState
              after: TViewProjectionState
            }
          | {
              // Deleting
              before: TViewProjectionState
              after: null
            },
      ]
    >
  }
}
