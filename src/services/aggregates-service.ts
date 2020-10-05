import { EventStore } from '../stores/event-store'
import { Aggregate } from '../types/aggregate'

export type AggregatesService = {
  exists: (aggregateId: string) => Promise<boolean>
  get: (aggregateId: string) => Promise<Aggregate | null>
}

export const createAggregatesService = (
  eventStore: EventStore,
): AggregatesService => {
  return {
    exists: async aggregateId => {
      const aggregate = await eventStore.getAggregate(aggregateId)
      return Boolean(aggregate)
    },

    get: async aggregateId => {
      return eventStore.getAggregate(aggregateId)
    },
  }
}
