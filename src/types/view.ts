import { Event } from './event'

export type ProjectionHandler<TEvent extends Event> = (
  event: TEvent,
) => Promise<void>

export type ViewDefinition = {
  projections: {
    [eventName: string]: ProjectionHandler<Event<any>>
  }
}
