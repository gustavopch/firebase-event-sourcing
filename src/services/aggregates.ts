import { EventStore } from '../stores/event-store'
import { Aggregate } from '../types/aggregate'

export type AggregatesService = {
  exists: (aggregateId: string | string[] | null) => Promise<boolean>
  get: <TAggregateIdOrIds extends string | string[]>(
    aggregateId: TAggregateIdOrIds,
  ) => Promise<
    TAggregateIdOrIds extends string[]
      ? Aggregate[]
      : TAggregateIdOrIds extends string
      ? Aggregate | null
      : never
  >
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

    get: async aggregateIdOrIds => {
      return (
        Array.isArray(aggregateIdOrIds)
          ? Promise.all(aggregateIdOrIds.map(id => eventStore.getAggregate(id)))
          : eventStore.getAggregate(aggregateIdOrIds)
      ) as Promise<any>
    },
  }
}
