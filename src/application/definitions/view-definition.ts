import { Event } from '../../elements/event'
import { ProjectionHandler } from '../../elements/projection-handler'
import { QueryHandler } from '../../elements/query-handler'

export type ViewDefinition = {
  projections: {
    [eventName: string]: ProjectionHandler<Event<any>>
  }

  queries: {
    [queryName: string]: QueryHandler
  }
}
