import { EventStore } from '../stores/event-store'
import { Aggregate } from '../types/aggregate'

export type AggregatesService = {
  exists: (aggregateId: string | string[] | null) => Promise<boolean>
  get: (aggregateId: string) => Promise<Aggregate | null>
}

export const createAggregatesService = (
  eventStore: EventStore,
): AggregatesService => {
  return {
    exists: async aggregateIdOrIds => {
      if (!aggregateIdOrIds) {
        return false
      }

      const aggregateIds = Array.isArray(aggregateIdOrIds)
        ? aggregateIdOrIds
        : [aggregateIdOrIds]

      const aggregates = await Promise.all(
        aggregateIds.map(id => eventStore.getAggregate(id)),
      )

      return aggregates.every(Boolean)
    },

    get: async aggregateId => {
      return eventStore.getAggregate(aggregateId)
    },
  }
}
