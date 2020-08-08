import { Event } from '../../elements/event'
import { ProjectionHandler } from '../../elements/projection-handler'

export type ViewDefinition = {
  projections: {
    [eventName: string]: ProjectionHandler<Event<any, any>>
  }
}
