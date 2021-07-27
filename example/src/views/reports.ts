import firebase from 'firebase-admin'

import { ViewDefinition } from '../../../src'

export const TOTALS_ID = 'totals'

declare global {
  namespace Views.Reports {
    type Report = {
      id: string
      orderCount: number
    }
  }
}

export const reports: ViewDefinition<Views.Reports.Report> = {
  collectionName: 'reports',

  projections: {
    'cart.orderPlaced': (event: Domain.Cart.OrderPlaced) => ({
      id: TOTALS_ID,
      orderCount: firebase.firestore.FieldValue.increment(1) as any,
    }),
  },
}
