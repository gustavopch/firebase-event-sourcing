import firebase from 'firebase-admin'

import { ViewDefinition } from '../../../src'
import * as Domain from '../domain'

export const TOTALS_ID = 'totals'

export type Report = {
  id: string
  orderCount: number
}

export const reportsCollection = () => {
  return firebase.firestore().collection('reports')
}

export const reports: ViewDefinition = {
  projections: {
    'cart.orderPlaced': async (event: Domain.Cart.OrderPlaced) => {
      const report: Report = {
        id: TOTALS_ID,
        orderCount: firebase.firestore.FieldValue.increment(1) as any,
      }

      await reportsCollection().doc(TOTALS_ID).set(report)
    },
  },
}
