import { defineView } from '../../../src'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from '../domain/shopping/cart'

const collection = 'reports'
const totalsId = 'totals'

export type Report = {
  id: string
  orderCount: number
}

export const reports = defineView({
  projections: {
    [SHOPPING_CART_ORDER_PLACED]: async (
      store,
      event: ShoppingCartOrderPlaced,
    ) => {
      const report: Report = {
        id: totalsId,
        orderCount: store.values.increment(1) as any,
      }

      await store.updateOrCreate(collection, totalsId, report)
    },
  },

  queries: {
    getTotals: async (store): Promise<Report> => {
      return (await store.get<Report>(collection, totalsId))!
    },
  },
})
