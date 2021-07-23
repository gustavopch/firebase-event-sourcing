import { LoggerService } from '../services/logger'
import { Event } from './event'
import { Services } from './service'

export type ProjectionContext = Services & {
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
