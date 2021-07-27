import { Trigger } from '../constants'
import { LoggerService } from '../services/logger'
import { ProjectionsService } from '../services/projections'
import { Event } from './event'
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

export type ViewDefinition<TViewProjectionState extends ViewProjectionState> = {
  collectionName: string

  projections: {
    [eventName: string]: ViewProjectionHandler<TViewProjectionState, Event<any>>
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
