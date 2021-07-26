import { Trigger } from '../constants'
import { LoggerService } from '../services/logger'
import { Event } from './event'
import { Services } from './service'

export type ViewProjectionState = {
  id: string
  [key: string]: any
}

export type ViewProjectionContext = Services & {
  logger: LoggerService
}

export type ViewProjectionHandler<
  TViewProjectionState extends ViewProjectionState,
  TEvent extends Event,
> = (
  event: TEvent,
  context: ViewProjectionContext,
) =>
  | Partial<TViewProjectionState>
  | Array<Pick<TViewProjectionState, 'id'> & Partial<TViewProjectionState>>

export type ViewReactionContext = Services & {
  logger: LoggerService
}

export type ViewReactionHandler<TParams extends any[]> = (
  ...params: [...params: TParams, context: ViewReactionContext]
) => Promise<void>

export type ViewDefinition<TViewProjectionState extends ViewProjectionState> = {
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
