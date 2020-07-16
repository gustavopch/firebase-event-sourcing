import { EventData } from './event-data'
import { EventMetadata } from './event-metadata'

export type Event<TEventData extends EventData = EventData> = {
  aggregateName: string
  aggregateId: string
  id: string
  name: string
  data: TEventData
  metadata: EventMetadata
}
