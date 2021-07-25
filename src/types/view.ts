import { LoggerService } from '../services/logger'
import { Event } from './event'
import { Services } from './service'

export type ViewProjectionState = {
  [key: string]: any
}

export type ViewContext = Services & {
  logger: LoggerService
}

export type ViewProjectionHandler<
  TViewProjectionState extends ViewProjectionState,
  TEvent extends Event,
> = (event: TEvent, context: ViewContext) => Partial<TViewProjectionState>

export type ViewDefinition<TViewProjectionState extends ViewProjectionState> = {
  projections: {
    [eventName: string]: ViewProjectionHandler<TViewProjectionState, Event<any>>
  }
}
