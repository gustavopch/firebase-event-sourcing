import { EventStore } from '../stores/event-store'
import { Aggregate } from '../types/aggregate'

export type AggregatesService = ReturnType<typeof createAggregatesService>

export const createAggregatesService = (eventStore: EventStore) => {
  return {
    exists: async (
      aggregateIdOrIds: string | string[] | null,
    ): Promise<boolean> => {
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

    get: async (aggregateId: string): Promise<Aggregate | null> => {
      return eventStore.getAggregate(aggregateId)
    },

    getAll: async (aggregateIds: string[]): Promise<Aggregate[]> => {
      return (
        await Promise.all(aggregateIds.map(id => eventStore.getAggregate(id)))
      ).filter((aggregate): aggregate is Aggregate => Boolean(aggregate))
    },
  }
}
