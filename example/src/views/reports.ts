import { defineView } from '../../../src'
import {
  SHOPPING_CART_ORDER_PLACED,
  ShoppingCartOrderPlaced,
} from '../domain/shopping/cart/events/order-placed'

export const REPORTS = 'reports'

export const TOTALS_ID = 'totals'

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
        id: TOTALS_ID,
        orderCount: store.values.increment(1) as any,
      }

      await store.updateOrCreate(REPORTS, TOTALS_ID, report)
    },
  },
})
