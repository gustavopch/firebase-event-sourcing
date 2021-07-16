import firebase from 'firebase-admin'

import { ViewDefinition } from '../../../src'
import * as CartEvents from '../domain/cart/events'

export const REPORTS = 'reports'

export const TOTALS_ID = 'totals'

export type Report = {
  id: string
  orderCount: number
}

export const reports: ViewDefinition = {
  projections: {
    'cart.orderPlaced': async (event: CartEvents.OrderPlaced) => {
      const db = firebase.firestore()

      const report: Report = {
        id: TOTALS_ID,
        orderCount: firebase.firestore.FieldValue.increment(1) as any,
      }

      await db.collection(REPORTS).doc(TOTALS_ID).set(report)
    },
  },
}
