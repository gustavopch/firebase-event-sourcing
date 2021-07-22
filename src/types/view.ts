import { LoggerService } from '../services/logger'
import { Event } from './event'

export type ProjectionContext = {
  logger: LoggerService
}

export type ProjectionHandler<TEvent extends Event> = (
  event: TEvent,
  context: ProjectionContext,
) => Promise<void>

export type ViewDefinition = {
  projections: {
    [eventName: string]: ProjectionHandler<Event<any>>
  }
}
