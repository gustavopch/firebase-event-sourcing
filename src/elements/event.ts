import { EventData } from './event-data'
import { EventMetadata } from './event-metadata'

export type Event<
  TEventName extends string = string,
  TEventData extends EventData = EventData
> = {
  aggregateName: string
  aggregateId: string
  id: string
  name: TEventName
  data: TEventData
  metadata: EventMetadata
}
