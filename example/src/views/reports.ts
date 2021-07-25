import firebase from 'firebase-admin'

import { ViewDefinition } from '../../../src'
import * as Domain from '../domain'

export const TOTALS_ID = 'totals'

export type Report = {
  id: string
  orderCount: number
}

export const reports: ViewDefinition<Report> = {
  projections: {
    'cart.orderPlaced': (event: Domain.Cart.OrderPlaced) => ({
      id: TOTALS_ID,
      orderCount: firebase.firestore.FieldValue.increment(1) as any,
    }),
  },
}
