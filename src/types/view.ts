import { LoggerService } from '../services/logger'
import { Event } from './event'
import { Services } from './service'

export type ProjectionState = {
  [key: string]: any
}

export type ProjectionContext = Services & {
  logger: LoggerService
}

export type ProjectionHandler<
  TProjectionState extends ProjectionState,
  TEvent extends Event,
> = (event: TEvent, context: ProjectionContext) => Partial<TProjectionState>

export type ViewDefinition<TProjectionState extends ProjectionState> = {
  projections: {
    [eventName: string]: ProjectionHandler<TProjectionState, Event<any>>
  }
}
