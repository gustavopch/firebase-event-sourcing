import { EventData } from './event-data'
import { EventMetadata } from './event-metadata'

export type Event<
  TProps extends {
    contextName: string
    aggregateName: string
    name: string
    data: EventData
  } = {
    contextName: string
    aggregateName: string
    name: string
    data: EventData
  }
> = {
  contextName: TProps['contextName']
  aggregateName: TProps['aggregateName']
  aggregateId: string
  id: string
  name: TProps['name']
  data: TProps['data']
  metadata: EventMetadata
}
