import firebaseAdmin from 'firebase-admin'

import { ViewDefinition } from '../../../src'
import { ShoppingCartOrderPlaced } from '../domain/shopping/cart/events/order-placed'

export const REPORTS = 'reports'

export const TOTALS_ID = 'totals'

export type Report = {
  id: string
  orderCount: number
}

export const reports: ViewDefinition = {
  projections: {
    'shopping.cart.orderPlaced': async (event: ShoppingCartOrderPlaced) => {
      const db = firebaseAdmin.firestore()

      const report: Report = {
        id: TOTALS_ID,
        orderCount: firebaseAdmin.firestore.FieldValue.increment(1) as any,
      }

      await db.collection(REPORTS).doc(TOTALS_ID).set(report)
    },
  },
}
